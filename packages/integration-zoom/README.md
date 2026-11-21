# @mariachi/integration-zoom

Zoom meetings for an app's own account, through a Server-to-Server OAuth app: schedule a meeting
and put its link on a booking, read what happened after (participants, the cloud recording, the
transcript), and receive Zoom's signed webhooks.

**Status: alpha.** Covered by unit tests against a scripted Zoom. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `ZOOM_ACCOUNT_ID` | The account the app acts in | App Marketplace › Developers › Build an app › Server-to-Server OAuth app › App credentials |
| `ZOOM_CLIENT_ID` | The app's client id (not a secret on its own) | The same page |
| `ZOOM_CLIENT_SECRET` | The app's client secret (secret) | The same page |
| `ZOOM_WEBHOOK_SECRET_TOKEN` | Checks the webhooks (secret, optional) | The app's Feature page (Features › Access), with Event Subscriptions: the Secret Token |

The app must be **activated** (its Activation page), with its scopes added, before it can get a
token. Zoom has no sandbox or test keys: use a separate app (or account) for test.

The client gets the account's access token itself (`POST https://zoom.us/oauth/token` with the
`account_credentials` grant), keeps it until shortly before its hour is up, and asks again when a
call answers 401.

### Scopes

Add the granular scopes for what the app calls (Scopes › Add Scopes):

| Call | Scope |
| --- | --- |
| `meetings.create` | `meeting:write:meeting:admin` |
| `meetings.get`, `meetings.startUrl` | `meeting:read:meeting:admin` |
| `meetings.update` | `meeting:update:meeting:admin` |
| `meetings.delete` | `meeting:delete:meeting:admin` |
| `meetings.list` | `meeting:read:list_meetings:admin` |
| `pastMeetings.get` | `meeting:read:past_meeting:admin` |
| `pastMeetings.participants` | `meeting:read:list_past_participants:admin` |
| `recordings.get` | `cloud_recording:read:list_recording_files:admin` |
| `transcripts.get` | `cloud_recording:read:meeting_transcript:admin` |
| `users.get` | `user:read:user:admin` |
| `meeting.*` events | `meeting:read:meeting:admin` (`meeting:read:participant:admin` for participant events) |
| `recording.*` events | `cloud_recording:read:recording:admin` |

## Use

```ts
import { createZoom, settings } from '@mariachi/integration-zoom';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const zoom = createZoom(settingsFromEnv(settings, readEnv), { tracer, metrics });
```

Every operation takes `ctx` first and makes one span (`zoom meetings.create`). A failure is a
`ZoomError` with a category and Zoom's numeric code in `providerCode`: only `rate-limited` and
`unavailable` are retried, and the client already did.

The host is a user of the account, by **id or email**. A Server-to-Server app acts for the whole
account, so it never uses Zoom's `me`.

### A call link on every booking

```ts
// The booking procedure
const meeting = await zoom.meetings.create(ctx, {
  userId: host.email,
  topic: `Intro call with ${guest.name}`,
  startTime: booking.startsAt,          // a Date, or '2026-12-01T15:00:00Z'
  duration: 30,
  settings: { waitingRoom: true, autoRecording: 'cloud' },
});
await bookings.update(ctx, booking.id, { zoomMeetingId: meeting.id, callUrl: meeting.join_url });

// Moved or cancelled
await zoom.meetings.update(ctx, { meetingId: booking.zoomMeetingId, startTime: newStart });
await zoom.meetings.delete(ctx, { meetingId: booking.zoomMeetingId });
```

**`join_url` is for attendees. The host's start link never is.** Zoom's `start_url` signs whoever
opens it in as the host, so the client takes it (and the host key) out of every meeting it
returns: a meeting can be stored, logged or emailed safely. When the host starts the meeting, read
the link fresh (it expires after two hours) and redirect them to it from the app's own page:

```ts
// GET /bookings/:id/start, for the host only
return redirect(await zoom.meetings.startUrl(ctx, { meetingId: booking.zoomMeetingId }));
```

**A create isn't retried after an outage.** Zoom takes no idempotency key, so a create retried
after a timeout could make a second meeting; the client retries it only after a rate limit, when
Zoom did nothing. Store the meeting's `id` as soon as you have it. Zoom also allows 100 creates and
updates per host per day (UTC); past that a call fails at once with `zoom/daily-limit`.

### The recording and transcript after the meeting

With `autoRecording: 'cloud'` (and audio transcripts turned on for the account), Zoom sends
`recording.completed` and then `recording.transcript_completed`. Read the files by the instance's
`uuid`, and download them through the client: Zoom refuses a download without the app's token.

```ts
import { transcriptFile, recordingFile } from '@mariachi/integration-zoom';

// The job for recording.transcript_completed
const { uuid } = payload.payload.object;
const recording = await zoom.recordings.get(ctx, uuid);
const transcript = transcriptFile(recording);                  // the WebVTT file, once it's ready
if (transcript) {
  const { body } = await zoom.recordings.download(ctx, { downloadUrl: transcript.download_url });
  await notes.save(ctx, { meetingUuid: uuid, vtt: await new Response(body).text() });
}
const video = recordingFile(recording, 'MP4');                  // stream video.download_url to storage the same way
```

`zoom.transcripts.get(ctx, uuid)` says whether a meeting's transcript can be downloaded yet
(`can_download`, and `download_restriction_reason` when not). `zoom.pastMeetings.get` and
`zoom.pastMeetings.participants` (paid accounts) say when it ran and who came. A meeting's number
reads its latest instance; a `uuid` reads that one (the client encodes a UUID with a `/` twice, as
Zoom requires).

## Receive events

```ts
import { WebhookController } from '@mariachi/webhooks';
import { ZoomWebhookBody, zoomEventType, zoomWebhookAuth } from '@mariachi/integration-zoom';

export class ZoomWebhooks extends WebhookController {
  readonly prefix = 'zoom';
  readonly auth = zoomWebhookAuth(config.zoom.webhookSecretToken);
  init() {
    this.post('events', { mode: 'queue', jobName: 'zoom-event', eventType: zoomEventType },
      async (_ctx, body) => ZoomWebhookBody.parse(body));
  }
}
```

Set `https://<app>/webhooks/zoom/events` as the Event notification endpoint URL, and subscribe to
the events the app uses: `meeting.started`, `meeting.ended`, `meeting.participant_joined`,
`meeting.participant_left`, `meeting.created`, `meeting.updated`, `meeting.deleted`,
`recording.completed`, `recording.transcript_completed`.

- **The signature:** `x-zm-signature` is `v0=` and the hex HMAC-SHA256 of
  `v0:<x-zm-request-timestamp>:<raw body>`, keyed with the secret token. A timestamp more than five
  minutes off is refused. Pass two secret tokens while rotating.
- **Zoom's endpoint check:** when the URL is set, and every 72 hours, Zoom posts a signed
  `endpoint.url_validation` and wants an answer within 3 seconds. The authenticator answers it
  before the route, so the app registers nothing for it.
- **Duplicates:** Zoom retries a delivery that fails with a 5xx, up to three times. Each delivery
  is deduplicated (with the `WebhookServer`'s idempotency store) on what Zoom signs: the event,
  its `event_ts`, the meeting instance's `uuid`, and the participant on participant events. Zoom
  doesn't document whether a retry keeps `event_ts`, so keep the job idempotent too: store by
  `uuid` (and the event).
- **The body:** the meeting's `id` is always a number (Zoom sends text in some events), and a
  recording event's `download_token` is dropped, so it never reaches a job's payload. The webhook
  log stores the raw body: pass `logPayload: false` on the route if recording events must not be
  kept there.

## Not in this package

- **A General (OAuth) app,** where each Zoom user connects their own account: it needs Zoom's
  Marketplace review and an end user's tokens in the connection store. This package is for the
  app's own account.
- Webinars, registrants, polls, live-meeting controls and the participant reports
  (`report:read:admin`).

## Test

```ts
import { fakeZoom, signedZoomWebhook, zoomEvent, zoomRecording, zoomUrlValidation } from '@mariachi/integration-zoom/testing';

const zoom = fakeZoom({ users: [{ id: 'host-1', email: 'host@example.com' }], recordings: [zoomRecording()] });
const ended = signedZoomWebhook(zoomEvent('meeting.ended', { id: 85000000001, uuid: 'uuid-1==' }), secretToken);  // post it to the controller
const check = zoomUrlValidation('plain-token', secretToken);   // check.expected is what Zoom wants back
```
