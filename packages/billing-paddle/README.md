# @mariachi/billing-paddle

[Paddle Billing](https://developer.paddle.com/) behind `@mariachi/billing`'s port. An app that bills
with `DefaultBilling` switches from Stripe to Paddle by configuration: plans, customers, checkout,
subscriptions, refunds, usage, the customer portal, invoices and the webhook-fed mirror all work the
same, and fail with the same `BillingError` codes. Paddle Billing only, not Paddle Classic.

Paddle is the **merchant of record**: it sells to your customer, collects and remits sales tax and
VAT, and pays you out. Prices are what the customer pays (tax included or added per the price's tax
mode), and invoices are Paddle's.

**Status: alpha.** Covered by unit tests against a scripted Paddle and an in-memory one. The
contract is in [contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `PADDLE_API_KEY` | The API key (secret) | Paddle › My account › Settings › Authentication › API keys |
| `PADDLE_CLIENT_TOKEN` | The client-side token for Paddle.js (public) | Same page, Client-side tokens tab |
| `PADDLE_WEBHOOK_SECRET` | The notification destination's secret key (secret, starts `pdl_ntfset_`) | Paddle › Events › Notifications › your destination › Edit destination |
| `PADDLE_CHECKOUT_URL` | Optional: the app's page that loads Paddle.js, on an approved website | Unset to use Paddle › Checkout › Checkout configuration › Default payment link |
| `PADDLE_ENVIRONMENT` | Only for an API key made before May 2025 (no `pdl_` prefix): `sandbox` or `production` | |

**Test is a separate sandbox account** (sandbox-vendors.paddle.com) with its own keys, token and
destination. The key's prefix picks the API: `pdl_sdbx_apikey_…` calls
`https://sandbox-api.paddle.com`, `pdl_live_apikey_…` calls `https://api.paddle.com`, and a key only
works against its own. The contract's checks refuse a live key (`pdl_live_apikey_`) or token
(`live_`) in test and a sandbox one (`pdl_sdbx_apikey_`, `test_`) in production. API keys expire (90
days by default): give the key the permissions for customers, prices and products, subscriptions,
transactions, adjustments, customer portal sessions and usage events.

## Use: `src/app.ts`

```ts
import { DefaultBilling, createBillingAdapter, createBillingWebhookHandler } from '@mariachi/billing';
import { DrizzleBillingStore } from '@mariachi/billing/postgres';
import { type PaddleConfig, createPaddleBillingAdapter, settings as paddleSettings } from '@mariachi/billing-paddle';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

const paddle = settingsFromEnv<PaddleConfig>(paddleSettings, readEnv);
const adapter = config.billing.provider === 'paddle'
  ? createPaddleBillingAdapter(paddle, { tracer, metrics })
  : createBillingAdapter({ adapter: 'stripe', secretKey: config.billing.secretKey });

const store = new DrizzleBillingStore(db);
const billing = new DefaultBilling({ adapter, store, defaultCurrency: 'usd' }, instrumentation);
```

Everything in [billing.md](../core/docs/billing.md) then holds, with the differences below. Every
Paddle call makes one span (`paddle subscriptions.update`); the port's methods carry no `ctx`, so
those spans have no tenant. For Paddle operations the port doesn't cover, `adapter.paddle` is the
client (`createPaddle`), with `ctx` first: `adapter.paddle.transactions.invoicePdfUrl(ctx, invoice.id)`.

## Checkout: the pricing page opens Paddle.js

Paddle's checkout runs in the browser, from Paddle.js and the client-side token. The backend makes
the transaction, so the tenant, customer and prices come from the server:

```ts
// A procedure the pricing page calls
const session = await billing.createCheckout(ctx, { mode: 'subscription', priceId: plan.id, successUrl, cancelUrl });
return { transactionId: session.id, url: session.url, clientToken: config.paddle.clientToken };
```

```html
<script src="https://cdn.paddle.com/paddle/v2/paddle.js"></script>
<script>
  // Only with a sandbox token (test_…): Paddle.js defaults to production
  Paddle.Environment.set('sandbox');
  Paddle.Initialize({
    token: clientToken,
    eventCallback(event) {
      if (event.name === 'checkout.completed') showThanks();   // the subscription itself arrives by webhook
    },
  });
  buyButton.onclick = async () => {
    const { transactionId } = await api.billing.checkout({ priceId });
    Paddle.Checkout.open({ transactionId, settings: { displayMode: 'overlay', successUrl: 'https://app.example.com/billing/done' } });
  };
</script>
```

Or redirect to `session.url`: it's the payment page (`PADDLE_CHECKOUT_URL`, else the default
payment link) with `?_ptxn=<transaction id>`, and Paddle.js on that page opens the checkout by
itself. The page must be on a website Paddle approved (Paddle › My account › Settings › Website
approval). Show prices with `Paddle.PricePreview()`, which localizes them for the visitor.

## Where Paddle differs

| Port method | With Paddle |
| --- | --- |
| `createCheckout` | A transaction (`txn_…`) whose `checkout.url` opens Paddle.js. `successUrl` and `cancelUrl` aren't Paddle's: set `successUrl` in `Paddle.Checkout.open`'s settings. `mode` isn't sent (the prices say whether it recurs). `trialDays` fails with `billing/not-supported`: a Paddle trial is set on the price |
| `subscribe` | `billing/not-supported`. Paddle makes a subscription when a checkout completes; it arrives as `subscription.synced` |
| `charge` | `billing/not-supported`: Paddle charges through a checkout or a subscription's renewal |
| `changePlan` | Sends the complete item list. `create_prorations` (default) → `prorated_next_billing_period`, `always_invoice` → `prorated_immediately`, `none` → `do_not_bill`. Paddle prorates at the moment of the change, so `prorationDate` isn't sent |
| `previewPlanChange` | Paddle's preview: the proration result and the transaction that bills it |
| `cancelSubscription` | At the period end Paddle schedules the cancel (`cancelAtPeriodEnd`, `cancelAt`); otherwise immediately |
| `pauseSubscription` / `resumeSubscription` | Pauses now. Resume starts a new billing period and charges for it now; on an active subscription it removes a scheduled cancel or pause |
| `refund` | An adjustment against the transaction (`chargeId` is the `txn_` id): the whole of it, or `amount` (tax included) from its line items in order. Most live refunds are `pending` until Paddle approves them; `charge.refunded` comes when it does |
| `createPortal` | Paddle's customer portal, signed in. It has no return URL |
| `listInvoices` | Billed, paid, completed and past-due transactions. `pdfUrl` is null: Paddle's PDF link expires in an hour, so ask for one when it's wanted (`adapter.paddle.transactions.invoicePdfUrl`) |
| `listPlans`, `findPlanByLookupKey` | Prices with their products. Paddle has no lookup key: put one in the price's `custom_data.lookupKey` |
| `reportUsage` | A Paddle usage event (usage-based billing is early access at Paddle): `metricName` is the meter's action (`api_calls`), the idempotency key its `event_key`. Paddle counts a resend once |
| `getCreditBalance` | Paddle's `available` credit for the customer |
| `grantCredits` and the ledger | Local, as with any provider. Paddle's own `adjustCreditBalance` is `billing/not-supported` |

**Idempotency keys.** Paddle takes none, so they aren't sent. A customer is unique by email: a
repeated `ensureCustomer` finds the tenant's own customer, and one with the same email that belongs
to another tenant is refused with `billing/invalid-input`, never shared. A refund is made once and
never retried (Paddle also refuses a second refund while one is pending). Usage events are
deduplicated by Paddle on their key and time. Updates set whole states, so a repeat changes nothing.

**The tenant** is written to `custom_data.tenantId` on the customer and each checkout's transaction;
Paddle copies it to the subscription the checkout makes and to its later transactions.

## Webhooks

Paddle signs each notification with the destination's secret: `Paddle-Signature: ts=…;h1=…`, the
HMAC-SHA256 of `<ts>:<raw body>`. A `ts` more than five seconds off is refused (Paddle's own
tolerance; `webhookToleranceSeconds` changes it), and deliveries are deduplicated on the signed
`event_id`. Subscribe the destination to the events in the contract.

**To keep the billing mirror**, use the port's handler, as with Stripe. Give it the raw body:

```ts
const paddleWebhooks = createBillingWebhookHandler({
  adapter, store,
  secret: paddle.webhookSecret!,
  idempotency: new RedisIdempotencyStore(redis),
  requireLivemode: config.env === 'production',
  on: { 'subscription.canceled': async (ctx, e) => entitlements.revoke(ctx, e.subscription) },
}, instrumentation);

// A route with no sign-in: the signature is the authentication
this.post('webhooks/paddle', { auth: false }, async (ctx) =>
  paddleWebhooks.handle(ctx, ctx.request.rawBody!, ctx.request.headers['paddle-signature'] as string | undefined));
```

| Paddle event | Billing events |
| --- | --- |
| `customer.created`, `customer.updated` | `customer.synced` |
| `subscription.created`, `activated`, `trialing`, `updated`, `past_due`, `paused`, `resumed`, `canceled` | `subscription.synced`, and `subscription.canceled` when it becomes canceled |
| `transaction.completed` | `invoice.paid`, `payment.succeeded`, and `checkout.completed` for a checkout's |
| `transaction.payment_failed` | `invoice.payment_failed`, `payment.failed` |
| `adjustment.created`, `adjustment.updated` (refunds) | the refund mirrored; `charge.refunded` once approved |
| `price.created`, `price.updated` | `plan.synced` |

Paddle doesn't guarantee order: the mirror is versioned by `occurred_at`. Its notifications don't
say which environment sent them, so `livemode` is whether the adapter's key is live.
`subscription.trial_will_end` and disputes have no Paddle event here: Paddle handles chargebacks as
the merchant of record.

**To receive Paddle's events as they are** (into a job, without the mirror), use the authenticator
with `WebhookServer`:

```ts
import { PaddleWebhookBody, paddleEventType, paddleWebhookAuth } from '@mariachi/billing-paddle';

export class PaddleWebhooks extends WebhookController {
  readonly prefix = 'paddle';
  readonly auth = paddleWebhookAuth(config.paddle.webhookSecret);   // two secrets while rotating
  init() {
    this.post('events', { mode: 'queue', jobName: 'paddle-event', eventType: paddleEventType },
      async (_ctx, body) => PaddleWebhookBody.parse(body));
  }
}
```

`verifyPaddleWebhook(rawBody, headers, secret)` is the same check as a plain function.

## Test

```ts
import { fakePaddleBillingAdapter, paddleNotification, paddlePrice, signedPaddleWebhook } from '@mariachi/billing-paddle/testing';

const adapter = fakePaddleBillingAdapter({ prices: [paddlePrice({ id: 'pri_pro', custom_data: { lookupKey: 'pro_monthly' } })] });
const billing = new DefaultBilling({ adapter, store: new MemoryBillingStore() });

const checkout = await billing.createCheckout(ctx, { mode: 'subscription', priceId: 'pri_pro', successUrl, cancelUrl });
const { subscription } = adapter.completeCheckout(checkout.id);          // what Paddle does when the customer pays
const { rawBody, signature } = signedPaddleWebhook(paddleNotification('subscription.created', subscription!), secret);
await paddleWebhooks.handle(ctx, rawBody, signature);
```

The fake is the real adapter over an in-memory Paddle API, so it keeps Paddle's rules: one customer
per email, subscriptions only from a completed checkout, usage counted once per key.
