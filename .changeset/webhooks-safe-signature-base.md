---
'@mariachi/webhooks': minor
---

`SignatureAuthController`, the base class for a signature scheme the ready-made authenticators don't
cover, now keeps two rules by construction instead of leaving them to each subclass.

- Dedup uses signed material only. The `eventIdHeader` option is gone: a delivery-id header the
  signature doesn't cover could be changed by whoever replays a captured delivery. The default key
  is a digest of the raw body; override `dedupKey` to return an id the signature covers.
- A tenant is authenticated. `resolveTenant(req)` is gone. Implement `tenantFromPayload(payload)`
  to read it from the verified body, or `tenantFromRequest(req)` together with
  `tenantSigningSecrets(tenantId)` so that the delivery must verify under that tenant's own secret. A tenant
  from the request with only a shared secret fails with `webhooks/unauthenticated-tenant`.

Breaking for subclasses: `verifySignature(signature, rawBody, secret, req)` is given one candidate
secret (from `signingSecrets()` or `tenantSigningSecrets()`, each of which may return several during a rotation) in
place of `(signature, rawBody, ctx, req)`, and `eventIdHeader` and `resolveTenant` no longer exist. A
subclass that verified against a field of its own now returns that field from `signingSecrets()`.
Dedup, which was off unless `eventIdHeader` was set, is now on for every subclass.
