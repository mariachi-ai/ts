---
"@mariachi/integration-revenuecat": minor
---

New: `@mariachi/integration-revenuecat`, RevenueCat's REST API v2 from its `contract.json`. You can read customers and their active entitlements (every page), list subscriptions and purchases, grant and revoke promotional entitlements, delete customers, and list entitlements, offerings and products. Pure `isEntitled` / `activeEntitlements` helpers read access at a given time. `revenueCatWebhookAuth` checks RevenueCat's HMAC signature, its Authorization header, or both, and dedupes on `event.id`. `customersToRefresh` names the customers to fetch again after a webhook. Includes a fake for tests.
