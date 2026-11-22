---
"@mariachi/billing-paypal": minor
"@mariachi/integrations": minor
---

New: `@mariachi/billing-paypal`, PayPal behind the billing port. `createPayPalBillingAdapter` lets `DefaultBilling` take one-time payments as orders the buyer approves and the server captures, subscriptions on billing plans with an approval link, refunds, plans and pause/resume/cancel; what PayPal can't do fails with `billing/not-supported`. `createPayPal` has PayPal's own operations (`ctx` first, OAuth token cached, `PayPal-Request-Id` on every create, capture and refund), deliveries are checked locally against PayPal's certificate and go through `createBillingWebhookHandler` (`payPalSignature(headers)`; the adapter's `normalizeWebhook` reads each event's state again from PayPal's API) or `WebhookServer` (`payPalWebhookAuth`), and `testing` has a fake and a delivery signer. Built from its `contract.json`. Contracts gain the `rsa-sha256-certificate` webhook scheme.

Subscription payments (`PAYMENT.SALE.COMPLETED`, `.REFUNDED`, `.REVERSED`) re-read the sale and its subscription from PayPal and report `subscription.synced` with `payment.succeeded` or `charge.refunded`, so renewals move `currentPeriodEnd` and a past-due subscription recovers. Through the billing handler a delivery's event id is its signed `PAYPAL-TRANSMISSION-ID`, not the unsigned body `id`, and transmissions more than four days off are refused by default (`webhookToleranceSeconds`).
