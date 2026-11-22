# @mariachi/integration-calendly

Calendly's event types, scheduled events and invitees: list them, book through the API, cancel,
mark no-shows, make single-use links, and receive bookings and cancellations as signed webhooks.
Every resource is named by its URI, as Calendly gives it.

**Status: alpha.** Covered by unit tests against a scripted Calendly. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `CALENDLY_ACCESS_TOKEN` | A personal access token (secret) | Profile menu › Developer › [Personal access tokens](https://calendly.com/app/developer?tab=personal_access_tokens), with `users:read`, `event_types:read`, `scheduled_events:read`, `scheduled_events:write`, `scheduling_links:write`, `webhooks:read`, `webhooks:write` |
| `CALENDLY_WEBHOOK_SIGNING_KEY` | Checks the webhooks (secret, optional) | A long random string of your own; `webhookSubscriptions.create` gives it to Calendly |

An organization owner's or admin's token covers everyone in the organization; anyone else's covers
only their own events. Calendly has no test mode: use a separate Calendly account for test.

**Not here: each end user connecting their own Calendly.** Calendly's OAuth (PKCE, single-use
refresh tokens) needs a store of each user's tokens, which Mariachi doesn't have yet. This package
is for the app's own Calendly account or organization.

## Use

```ts
import { createCalendly, settings } from '@mariachi/integration-calendly';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const calendly = createCalendly(settingsFromEnv(settings, readEnv), { tracer, metrics });

// The URIs everything else takes
const me = await calendly.users.me(ctx);
const org = me.current_organization;

// Upcoming bookings, every page
for await (const event of calendly.scheduledEvents.all(ctx, { organization: org, status: 'active', minStartTime: new Date().toISOString() })) {
  for await (const invitee of calendly.invitees.all(ctx, { event: event.uri })) { /* ... */ }
}

// A link that books once, for one person
const { booking_url } = await calendly.schedulingLinks.create(ctx, eventType.uri);
```

Every operation takes `ctx` first and makes one span (`calendly scheduledEvents.list`). A failure is
a `CalendlyError` with a category: only `rate-limited` and `unavailable` are retried, and the client
already did. `providerCode` is Calendly's error title (`Permission Denied`, `Insufficient scope`).

Calendly limits each user to 500 requests a minute on a paid plan and 50 on the free plan.

### Book from the app

Calendly's Scheduling API books without its pages. Pick an open time, then book it:

```ts
const times = await calendly.eventTypes.availableTimes(ctx, { eventType: type.uri, startTime, endTime });   // at most 31 days
const invitee = await calendly.invitees.create(ctx, {
  eventType: type.uri,
  startTime: times[0].start_time,
  invitee: { name: user.name, email: user.email, timezone: 'America/New_York' },
  location: { kind: 'zoom_conference' },        // one of the event type's locations; leave it out if it has none
  tracking: { utmContent: user.id },            // to match the booking back to the user
});
```

Calendly sends its usual emails and invites, and an `invitee.created` webhook follows. It takes no
idempotency key, so a booking is never retried after an outage: check `invitees.list` before
booking again. Event types that take a payment can't be booked this way. On the free plan and in
trials, a user can be booked through the API five times a day.

## Show the booking page

Embed an event type's `scheduling_url` with Calendly's widget, filled in for the signed-in user:

```html
<div id="calendly" style="min-width:320px; height:700px;"></div>
<script src="https://assets.calendly.com/assets/external/widget.js"></script>
<script>
  Calendly.initInlineWidget({
    url: 'https://calendly.com/YOUR_LINK/30min',
    parentElement: document.getElementById('calendly'),
    prefill: { name: 'Grace Hopper', email: 'grace@example.com' },
    utm: { utmContent: 'USER_ID' },
  });
  window.addEventListener('message', (e) => {
    if (e.data.event === 'calendly.event_scheduled') {
      // e.data.payload.invitee.uri: pass it to the app, which reads it with calendly.invitees.get
    }
  });
</script>
```

Use `firstName` and `lastName` in `prefill` for event types that ask for them apart. UTM values are
at most 255 characters.

## Match invitees to the app's users

An invitee is an email address the person typed on the booking form. To link a booking to a user:

1. **By the app's own id**, when the app made the link: `utm: { utmContent: user.id }` in the embed
   (or `tracking.utmContent` when booking through the API) comes back as
   `invitee.tracking.utm_content`.
2. **By email** otherwise: compare `emailKey(invitee.email)` with the user's email, lowercased the
   same way. `scheduledEvents.list(ctx, { organization, inviteeEmail })` finds a user's bookings.

Neither is proof of who booked: Calendly doesn't verify the email, and anyone can edit a URL's UTM
values. Use a match to show a user their bookings, never to grant access.

## Receive bookings as they happen

Make the subscription once (at deploy, or from an admin action), then receive it:

```ts
await calendly.webhookSubscriptions.create(ctx, {
  url: 'https://app.example.com/webhooks/calendly/events',
  events: ['invitee.created', 'invitee.canceled'],
  scope: 'organization',
  organization: org,
});
```

```ts
import { WebhookController } from '@mariachi/webhooks';
import { CalendlyWebhookBody, calendlyEventType, calendlyWebhookAuth, isInviteeEvent } from '@mariachi/integration-calendly';

export class CalendlyWebhooks extends WebhookController {
  readonly prefix = 'calendly';
  readonly auth = calendlyWebhookAuth(config.calendly.webhookSigningKey);
  init() {
    this.post('events', { mode: 'queue', jobName: 'calendly-event', eventType: calendlyEventType },
      async (_ctx, body) => CalendlyWebhookBody.parse(body));
  }
}

// The job
if (isInviteeEvent(body)) {
  const { payload } = body;                      // the invitee, with payload.scheduled_event
  if (body.event === 'invitee.canceled' && payload.rescheduled) { /* payload.new_invitee is the new booking */ }
}
```

- **The signature:** `Calendly-Webhook-Signature: t=…,v1=…`, the hex HMAC-SHA256 of `t`, `.` and
  the raw body. A delivery signed more than three minutes ago is refused, as Calendly recommends.
- **Retries:** Calendly retries a failed delivery for 24 hours, then disables the subscription
  (`state: 'disabled'`): delete it and make it again. Deliveries are deduplicated by
  `calendlyEventKey(body)`, a digest of the event, the invitee's URI and the payload's
  `created_at`; store bookings keyed by the invitee's `uri`.
- **One subscription per URL:** a second fails with `calendly/already-exists`. To change its events
  or signing key, delete it (`webhookSubscriptions.delete`) and make it again.
- **A reschedule** is two events: `invitee.canceled` for the old booking (`rescheduled: true`,
  `new_invitee`) and `invitee.created` for the new one (`old_invitee`).
- Other events (`invitee_no_show.*`, `routing_form_submission.created`, which needs the organization
  scope) parse with their payload as Calendly sent it.

## Test

```ts
import { fakeCalendly, signedCalendlyWebhook, testEventType, testInvitee, testInviteeEvent } from '@mariachi/integration-calendly/testing';

const type = testEventType();
const calendly = fakeCalendly({ eventTypes: [type], availableTimes: { [type.uri]: ['2026-11-25T15:00:00.000Z'] } });
const { rawBody, headers } = signedCalendlyWebhook(testInviteeEvent('invitee.created', testInvitee()), signingKey);   // post it to the controller
```
