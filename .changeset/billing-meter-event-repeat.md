---
'@mariachi/billing': patch
---

A usage report that Stripe already has is taken as received.

`reportUsage` resends a record whose first attempt may not have arrived. Stripe's v1 meter events
endpoint answers a repeated identifier with a 400 that has no error code, only the message "An event
already exists with identifier …", so the check for `duplicate_meter_event` never matched and the
resend failed every time for as long as Stripe remembered the identifier. That message is now
recognised (on a 400 `invalid_request_error` only), and the record is marked forwarded.
