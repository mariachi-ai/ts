---
'@mariachi/realtime': minor
---

The default channel policy matches a channel against the caller's whole tenant id and user id, in
place of splitting the name on `:`. A tenant or user id that contains a colon is now refused by it:
such a tenant was already denied its own channels, and a broadcast to `tenant:a:b:chat` meant for
tenant `a:b` reached tenant `a`'s subscribers to its channel `b:chat`.

New `tenantChannel(tenantId, ...segments)`, `userChannel(userId, ...segments)` and
`tenantUserChannel(tenantId, userId, ...segments)` build channel names the way the policy reads
them, and throw `realtime/invalid-channel` for an id containing a colon. Use them for the names you
broadcast to.

Also stricter: `tenant:<id>:` with nothing after the last colon, and `public:` with no name, are denied.
