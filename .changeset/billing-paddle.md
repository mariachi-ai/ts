---
"@mariachi/billing-paddle": minor
---

New: `@mariachi/billing-paddle`, Paddle Billing behind the billing port, built from its `contract.json`. `createPaddleBillingAdapter` plugs into `DefaultBilling` and `createBillingWebhookHandler` in place of Stripe: customers, plans (lookup keys from `custom_data.lookupKey`), checkout as a transaction opened by Paddle.js, plan changes with Paddle's proration modes, cancel, pause and resume, refunds as adjustments, invoices, credit, usage events and the customer portal; what Paddle can't do (`subscribe`, `charge`, `adjustCreditBalance`, a checkout trial) fails with the port's `billing/not-supported`. It also exports `createPaddle` (the API client), `paddleWebhookAuth` and `verifyPaddleWebhook` for `Paddle-Signature`, and an in-memory fake for tests. It reads Paddle's webhook events through `BillingAdapter.normalizeWebhook`.
