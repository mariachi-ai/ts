# @mariachi/integration-cal-com

Cal.com's event types, free slots and bookings through API v2, and its signed webhooks as bookings
are made, moved and cancelled. Slots come back as one list in UTC, booking starts are sent in UTC
whatever their offset, and each endpoint gets the `cal-api-version` it asks for.

**Status: alpha.** Covered by unit tests against a scripted Cal.com. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `CALCOM_API_KEY` | An API key (secret). It acts as the user who made it | Settings › Developer › API keys ([app.cal.com/settings/developer/api-keys](https://app.cal.com/settings/developer/api-keys)) |
| `CALCOM_WEBHOOK_SECRET` | Checks the webhooks (secret, optional) | A long random string of your own; `webhooks.create` gives it to Cal.com |
| `CALCOM_API_BASE_URL` | Only for a self-hosted Cal.com | Your instance's API v2 address, the one that stands for `https://api.cal.com/v2` |

Cal.com's docs describe test keys (`cal_`) and live keys (`cal_live_`), but the dashboard makes no
test keys, so the prefix says nothing and no key is checked for it. Use a separate Cal.com account
for test.

The key belongs to one Cal.com user, and every call acts as them: their event types, their
bookings, their webhooks. Connecting each of an app's users to their own Cal.com account needs
Cal.com's OAuth, which Cal.com opens only to clients it has approved; this package doesn't do it.

## Use

```ts
import { createCalCom, settings, slotList } from '@mariachi/integration-cal-com';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const calcom = createCalCom(settingsFromEnv(settings, readEnv), { tracer, metrics });

// What can be booked
const [intro] = await calcom.eventTypes.list(ctx);                     // the key's own event types

// When: one list of { start, end } in UTC, earliest first
const free = slotList(await calcom.slots.list(ctx, { eventTypeId: intro.id, start: '2026-12-01', end: '2026-12-07', timeZone: 'Europe/Rome' }));

// Book one: Cal.com sends the invites
const booking = await calcom.bookings.create(ctx, {
  eventTypeId: intro.id,
  start: free[0].start,
  attendee: { name: user.name, email: user.email, timeZone: user.timeZone },
  metadata: { appUser: user.bookingRef },                              // comes back in every webhook
});

// Later
await calcom.bookings.reschedule(ctx, { bookingUid, start: newStart });   // a new booking, with a new uid
await calcom.bookings.cancel(ctx, { bookingUid, cancellationReason: 'Plans changed' });
for await (const b of calcom.bookings.all(ctx, { afterUpdatedAt: lastWebhookAt })) { /* catch up */ }
```

Every operation takes `ctx` first and makes one span (`cal-com bookings.create`). A failure is a
`CalComError` whose category comes from the HTTP status (Cal.com documents no codes of its own):
only `rate-limited` and `unavailable` are retried, and the client already did.

- **A booking is never retried after an outage.** Cal.com takes no idempotency key, and it may have
  booked before failing, so `bookings.create` is retried only when Cal.com rate-limited it. A
  `cal-com/unavailable` from it means "maybe booked": look with
  `bookings.list({ attendeeEmail, afterStart })` before booking again. The same holds for cancel,
  reschedule, confirm and decline.
- **Times.** `slots.list` groups slots by date in `timeZone` and writes them with its offset; show
  them that way, and store or compare `slotList`'s UTC times. Booking starts may carry any offset.
- **Recurring event types** answer with every occurrence, so `create`, `get`, `cancel` and the rest
  return `Booking | Booking[]`.
- **Event types that require confirmation** make `pending` bookings, which the host accepts with
  `bookings.confirm` or refuses with `bookings.decline`.
- **API versions** are pinned in `CAL_API_VERSIONS`, one date per endpoint, as Cal.com asks.

## Send people to Cal.com's own booking page

An event type's `bookingUrl` is its public page. For a username and slug the app knows,
`bookingPageUrl` builds the same, and fills in the form:

```ts
import { bookingPageUrl } from '@mariachi/integration-cal-com';

bookingPageUrl({ username: 'alice', eventSlug: 'intro', prefill: { name: user.name, email: user.email } });
// https://cal.com/alice/intro?name=Ada+Lovelace&email=ada%40example.com
```

Pass `origin` for a self-hosted Cal.com.

### Or embed it

The embed is Cal.com's own browser script. Copy the loader snippet from the event type's
**Embed** menu in Cal.com (it matches your instance, self-hosted too), then point it at the event
type with its Cal link (`calLink(username, eventSlug)` on the server):

```html
<div id="booking"></div>
<script>
  /* the loader snippet from Cal.com's Embed menu goes here */
  Cal("init", { origin: "https://cal.com" });
  Cal("inline", {
    elementOrSelector: "#booking",
    calLink: "alice/intro",
    config: { name: "Ada Lovelace", email: "ada@example.com", "metadata[appUser]": "<the user's booking ref>" },
  });
</script>
```

For a button that opens it in a pop-up, give the button `data-cal-link="alice/intro"` instead.
`metadata[appUser]` arrives in every webhook for the booking as `metadata.appUser`.

## Receive bookings as they change

```ts
import { WebhookController } from '@mariachi/webhooks';
import { CalComWebhookBody, calComEventType, calComWebhookAuth } from '@mariachi/integration-cal-com';

export class CalComWebhooks extends WebhookController {
  readonly prefix = 'cal-com';
  readonly auth = calComWebhookAuth(config.calcom.webhookSecret);
  init() {
    this.post('events', { mode: 'queue', jobName: 'cal-com-event', eventType: calComEventType },
      async (_ctx, body) => CalComWebhookBody.parse(body));
  }
}

// At deploy, or from an admin action: once per URL (list first, it isn't idempotent)
await calcom.webhooks.create(ctx, { subscriberUrl: 'https://app.example.com/webhooks/cal-com/events', triggers: ['BOOKING_CREATED', 'BOOKING_RESCHEDULED', 'BOOKING_CANCELLED'] });
```

```ts
// The job
import { webhookBooking } from '@mariachi/integration-cal-com';

const booking = webhookBooking(payload);   // the same shape for every booking event, or undefined
if (booking?.triggerEvent === 'BOOKING_RESCHEDULED') await moveBooking(ctx, booking.rescheduleUid, booking.uid);
```

- `X-Cal-Signature-256` is the hex HMAC-SHA256 of the raw body with the secret; a delivery that
  doesn't match is answered 401. So is one from a webhook made without a secret.
- Cal.com signs no delivery id, so deliveries are deduplicated on the signature's digest: the same
  body twice is handled once. Make the job safe to run again for a booking's `uid` and trigger.
- `MEETING_STARTED` and `MEETING_ENDED` bodies are flat, with no `payload`; `webhookBooking` reads
  them the same as the others. Statuses are upper case in webhooks (`ACCEPTED`), lower case in the API.
- Leave the webhook's payload template empty: a custom template changes the body these schemas read.
- A webhook made in Cal.com's settings works the same: enter `CALCOM_WEBHOOK_SECRET` as its secret.

## Match a booking to the app's user

1. **By your own reference, best.** Put a reference to the user in the booking's metadata: in
   `bookings.create({ metadata })`, or as `metadata[appUser]` in the embed's config. It comes back
   as `booking.metadata.appUser`. Metadata from an embed is what the booker's browser sent, so use a reference the app issued and can look up (a random token
   stored with the user), not a bare user id someone could swap.
2. **By the attendee's email, otherwise.** `attendeeEmails(booking)` gives the addresses lowercased
   and each once, from an API booking or `webhookBooking`; look them up lowercased too:

   ```ts
   const [email] = attendeeEmails(booking);                    // the booker is first
   const user = email ? await users.findByEmail(ctx, email) : undefined;
   ```

   The booker types the address, and Cal.com doesn't check it unless the event type requires email
   verification, so match on it to file the booking, never to grant access. Guests are attendees
   too, and on a seated event type a webhook names only the seat that changed.

## Not here

- **OAuth** (each end user connecting their own Cal.com): Cal.com approves OAuth clients one by
  one; use an API key.
- Team, organization and platform endpoints; event-type webhooks; slot reservations; making or
  editing event types.
- Webhook triggers for routing forms' fallbacks, delegation credentials, Cal Events registrations,
  sequences and the Cal Video no-show checks (which need a delay when made).

## Test

```ts
import { calComBooking, calComBookingEvent, calComEventType, fakeCalCom, signedCalComWebhook } from '@mariachi/integration-cal-com/testing';

const calcom = fakeCalCom({ eventTypes: [calComEventType({ id: 10 })], slots: { 10: { '2026-12-01': [{ start: '2026-12-01T09:00:00Z', end: '2026-12-01T09:30:00Z' }] } } });
const { rawBody, headers } = signedCalComWebhook(calComBookingEvent('BOOKING_CREATED', calComBooking()), secret);   // post it to the controller
```

The fake books, cancels, reschedules, confirms and declines in memory, and fails the way the client
does (`cal-com/not-found`, `cal-com/invalid-request` for a slot already booked).
