# @mariachi/integration-google-drive

Google Drive: list, read, export, upload, move and share files, and watch for changes. One client,
two ways in: **the app's own Drive** through a service account, or **each user's own Drive** through
their access token.

**Status: alpha.** Covered by unit tests against a scripted Drive. The contract is in
[contract.json](./contract.json).

## Settings

| Variable | What it is | Where to find it |
| --- | --- | --- |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` | The service account's JSON key (secret, optional) | Cloud console › IAM & Admin › Service accounts › Keys › Add key › JSON |
| `GOOGLE_DRIVE_FOLDER_ID` | Where uploads and new folders go by default (optional) | A folder's id (`drive.google.com/drive/folders/<id>`), or a shared drive's id |
| `GOOGLE_DRIVE_IMPERSONATE` | A Workspace user the service account acts as (optional) | Domain-wide delegation, set up by a super administrator |
| `GOOGLE_DRIVE_CHANNEL_TOKEN` | Checks change notifications (secret, optional) | A random string of your own, up to 256 characters |
| `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET` | The app's OAuth client, for users' Drives (optional) | Cloud console › APIs & Services › Credentials. Read by the app's OAuth flow, not by this client |

There is no test mode: use another service account and folder (or another Cloud project) for test.

## The app's own Drive: a service account

```ts
import { createGoogleDrive, settings } from '@mariachi/integration-google-drive';
import { settingsFromEnv } from '@mariachi/integrations';
import { readEnv } from '@mariachi/config';

// src/app.ts: once, with the container's tracer and metrics
const drive = createGoogleDrive(settingsFromEnv(settings, readEnv), { tracer, metrics });

const file = await drive.files.upload(ctx, { name: 'invoice-1042.pdf', mimeType: 'application/pdf', content: pdfBytes, appProperties: { invoiceId } });
await drive.permissions.create(ctx, { fileId: file.id, type: 'user', role: 'reader', emailAddress: customerEmail });
```

The client signs a JWT with the key (RS256, `jose`), exchanges it at
`https://oauth2.googleapis.com/token` for an access token with the `drive` scope, and caches it
until five minutes before it expires (`google-drive auth.token` is its own span).

**A service account has no storage of its own,** so uploading into its "My Drive" fails with
`google-drive/storage-quota-exceeded`. Pick one:

- **A shared drive** (Google Workspace): add the service account's email as a member of the shared
  drive and set `GOOGLE_DRIVE_FOLDER_ID` to the shared drive's id (or a folder in it). Every call
  sends `supportsAllDrives=true`. Files belong to the shared drive.
- **Domain-wide delegation** (Google Workspace): a super administrator authorizes the service
  account's numeric client ID with the `https://www.googleapis.com/auth/drive` scope in the Admin
  console ([Google's guide](https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority)),
  and `GOOGLE_DRIVE_IMPERSONATE` names the user it acts as (the JWT's `sub`). Files land in that
  user's Drive and count against their storage. Until it's authorized, calls fail with
  `google-drive/delegation-not-authorized`.

**Reading** a My Drive folder someone shared with the service account's email works without either.

To narrow the service account's reach, pass `scope` (`deps.scope`), for example
`https://www.googleapis.com/auth/drive.file` for only the files it creates.

## Each user's own Drive: their token

Mariachi doesn't store users' OAuth tokens yet (a per-user connection store is planned). Until
then the app runs Google's OAuth flow itself, with `GOOGLE_DRIVE_CLIENT_ID` and
`GOOGLE_DRIVE_CLIENT_SECRET` (`https://accounts.google.com/o/oauth2/v2/auth`, then
`https://oauth2.googleapis.com/token`; `access_type=offline` for a refresh token), keeps the tokens
encrypted, and gives the client the user's current access token per call:

```ts
const userDrive = createGoogleDrive({}, {
  tracer, metrics,
  accessToken: async (ctx) => googleTokens.accessTokenFor(ctx, ctx.userId),   // the app's own store, refreshed
});
const page = await userDrive.files.list(ctx, { q: driveQuery.trashed(false) });
```

A client takes a key or `accessToken`, never both: build one client for each.

**Which scope to ask users for.** Ask for `https://www.googleapis.com/auth/drive.file` and let
users pick files with the [Google Picker](https://developers.google.com/workspace/drive/picker/guides/overview).
It's a non-sensitive scope: the app sees only the files the user picked or the app created, and
Google's basic verification is enough. `drive` and `drive.readonly` (every file in the user's Drive)
are **restricted** scopes: an app that stores or sends that data from its servers needs Google's
[restricted-scope verification](https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification)
and a security assessment (CASA), repeated every 12 months. See
[Choose Google Drive API scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth).
A file the app can't see under `drive.file` fails with `google-drive/app-not-authorized` or
`google-drive/not-found`.

## Files

```ts
import { driveQuery, EXPORT_MIME_TYPES } from '@mariachi/integration-google-drive';

// Queries are built from terms that quote and escape their values; files.list takes nothing else
const q = driveQuery.and(driveQuery.inFolder(folderId), driveQuery.nameContains(search), driveQuery.trashed(false));
for await (const file of drive.files.all(ctx, { q, orderBy: 'modifiedTime desc' })) { /* ... */ }

const meta = await drive.files.get(ctx, { fileId });
const { bytes, contentType } = await drive.files.download(ctx, { fileId });          // a stored file
const pdf = await drive.files.export(ctx, { fileId, mimeType: EXPORT_MIME_TYPES.pdf }); // a Google Doc, up to 10 MB
const csv = await drive.files.export(ctx, { fileId: sheetId, mimeType: EXPORT_MIME_TYPES.csv }); // the first sheet only

const folder = await drive.folders.create(ctx, { name: 'Reports' });
await drive.files.update(ctx, { fileId, addParent: folder.id, removeParent: oldParentId });   // move
await drive.files.trash(ctx, { fileId });     // restorable
await drive.files.delete(ctx, { fileId });    // for good
```

- **Uploads** up to 5 MB are one multipart request; larger ones go through a resumable session,
  given the whole content in one PUT (it's held in memory; resuming an interrupted upload isn't
  offered). Drive takes no idempotency key, so an upload is retried only after a rate limit, never
  after an outage: tag files with `appProperties` and look (`driveQuery.appProperty`) before
  uploading again.
- **Fields:** each call asks Drive for `FILE_FIELDS`; pass `fields` for others.
- **Shared drives:** `driveId` searches one; `allDrives: true` searches everything the caller can see.

Every operation takes `ctx` first and makes one span (`google-drive files.upload`). A failure is a
`GoogleDriveError` with a category: only `rate-limited` and `unavailable` are retried, and the
client already did. Drive answers some rate limits with a 403 (`userRateLimitExceeded`); the client
reads the reason, so those are retried too.

## Watching for changes

Drive posts to the app when something changes, through a push channel the app starts. The
notifications aren't signed and carry no file data: each carries back the channel token, and the
app then lists the changes since the page token it stored.

```ts
// Once: where to start, and a channel (it expires within a week)
const pageToken = await drive.changes.getStartPageToken(ctx);
const channel = await drive.channels.start(ctx, { pageToken, address: 'https://app.example.com/webhooks/google-drive/changes' });
// store { channel.id, channel.resourceId, channel.expiration, pageToken }
```

```ts
import { WebhookController } from '@mariachi/webhooks';
import { GoogleDriveNotification, googleDriveChannelAuth, googleDriveEventType, isDriveChange } from '@mariachi/integration-google-drive';

export class DriveWebhooks extends WebhookController {
  readonly prefix = 'google-drive';
  readonly auth = googleDriveChannelAuth(config.googleDrive.channelToken);   // two while rotating
  init() {
    // The body is empty: the notification is in its headers
    this.post('changes', { mode: 'queue', jobName: 'drive-changes', eventType: googleDriveEventType },
      async (ctx, _body) => GoogleDriveNotification.parse(ctx.identity.metadata));
  }
}

// The job
if (!isDriveChange(notification)) return;               // the channel's first message, `sync`
const stored = await channels.byId(ctx, notification.channelId);
const { changes, newStartPageToken } = await drive.changes.since(ctx, { pageToken: stored.pageToken });
// handle changes (c.removed, c.file), then store newStartPageToken
```

`googleDriveChannelAuth` compares `X-Goog-Channel-Token` with the token in constant time and
answers 401 otherwise. Treat each notification as "something changed": reading the changes from
the stored token makes a repeated notification harmless.

**Renewal.** Channels aren't renewed by Google. Run a scheduled job (daily) that, for each stored
channel where `channelNeedsRenewal(channel)` (expiring within a day), starts a new channel from the
stored page token and then stops the old one with `drive.channels.stop(ctx, { id, resourceId })`.
The two overlap briefly; that's fine. A channel started with a user's token can only be stopped
with that user's token.

## Test

```ts
import { fakeGoogleDrive, googleDriveNotification } from '@mariachi/integration-google-drive/testing';

const drive = fakeGoogleDrive({ folderId: 'root', files: [{ id: 'f1', name: 'a.txt', mimeType: 'text/plain', content: 'hi' }] });
const { headers } = googleDriveNotification(channelToken, { channelId });   // post it, with an empty body, to the controller
```

The fake keeps files, permissions, channels and a change log in memory; its `files.list` ignores
`q`.
