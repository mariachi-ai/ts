// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Google Drive: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'google-drive',
  name: 'Google Drive',
  category: 'files',
  server: 'www.googleapis.com',
  baseUrl: 'https://www.googleapis.com',
  docs: 'https://developers.google.com/workspace/drive/api/guides/about-sdk',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'serviceAccountJson',
    env: 'GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON',
    label: 'Service account key',
    meaning: "The app's own Drive: the service account's JSON key, signed into a short-lived access token. Leave it unset when every call uses a user's own token.",
    secret: true,
    required: false,
    whereToFind: 'Google Cloud console › IAM & Admin › Service accounts › the account › Keys › Add key › Create new key › JSON: the whole file, as one string. A service account has no storage of its own: add it to a shared drive (GOOGLE_DRIVE_FOLDER_ID), or set GOOGLE_DRIVE_IMPERSONATE. Use a separate service account and folder for test.',
    url: 'https://console.cloud.google.com/iam-admin/serviceaccounts',
  },
  {
    key: 'folderId',
    env: 'GOOGLE_DRIVE_FOLDER_ID',
    label: 'Folder or shared drive',
    meaning: "Where uploads and new folders go when no parent is given: a folder's id, or a shared drive's id (which is also the id of its top-level folder).",
    secret: false,
    required: false,
    whereToFind: "The last part of the folder's address in Drive: drive.google.com/drive/folders/<id>. Share the folder, or add the service account's email as a member of the shared drive, so it can add files there.",
    url: 'https://developers.google.com/workspace/drive/api/guides/about-shareddrives',
  },
  {
    key: 'impersonate',
    env: 'GOOGLE_DRIVE_IMPERSONATE',
    label: 'Act as user',
    meaning: "Domain-wide delegation: the service account acts as this Google Workspace user (the token's sub claim), with that user's Drive and storage.",
    secret: false,
    required: false,
    whereToFind: "A user's email address in the Workspace domain. A super administrator first authorizes the service account's numeric client ID, with the Drive scope, in the Admin console under Domain-wide delegation (Manage Domain Wide Delegation).",
    url: 'https://developers.google.com/identity/protocols/oauth2/service-account#delegatingauthority',
  },
  {
    key: 'channelToken',
    env: 'GOOGLE_DRIVE_CHANNEL_TOKEN',
    label: 'Channel token',
    meaning: "Checks that a change notification came from a watch the app started. You choose it; it's sent to Google when the watch starts, and Google sends it back on every notification.",
    secret: true,
    required: false,
    whereToFind: 'Any long random string of your own, up to 256 characters: channels.start gives it to Google.',
    url: 'https://developers.google.com/workspace/drive/api/guides/push',
  },
  {
    key: 'clientId',
    env: 'GOOGLE_DRIVE_CLIENT_ID',
    label: 'OAuth client ID',
    meaning: "For the app's own OAuth flow, when each user connects their own Drive. This client doesn't read it: it takes the user's access token from the app.",
    secret: false,
    required: false,
    whereToFind: 'Google Cloud console › APIs & Services › Credentials › Create credentials › OAuth client ID (Web application).',
    url: 'https://console.cloud.google.com/apis/credentials',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'GOOGLE_DRIVE_CLIENT_SECRET',
    label: 'OAuth client secret',
    meaning: "For the app's own OAuth flow, with the client ID. This client doesn't read it.",
    secret: true,
    required: false,
    whereToFind: 'Google Cloud console › APIs & Services › Credentials › the OAuth client.',
    url: 'https://console.cloud.google.com/apis/credentials',
  },
];

/** The config `createGoogleDrive` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  serviceAccountJson: z.string().min(1).optional(),
  folderId: z.string().min(1).optional(),
  impersonate: z.string().min(1).optional(),
  channelToken: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  clientSecret: z.string().min(1).optional(),
});
export type GoogleDriveConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  serviceAccountJson: 'GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON',
  folderId: 'GOOGLE_DRIVE_FOLDER_ID',
  impersonate: 'GOOGLE_DRIVE_IMPERSONATE',
  channelToken: 'GOOGLE_DRIVE_CHANNEL_TOKEN',
  clientId: 'GOOGLE_DRIVE_CLIENT_ID',
  clientSecret: 'GOOGLE_DRIVE_CLIENT_SECRET',
} as const;

export const credentials = {
  kind: 'app-or-user',
  oauth: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
    refresh: true,
  },
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'auth.token': {
    purpose: "Exchanges the service account's signed JWT (RS256; iss, scope, aud, iat, exp at most an hour later, and sub when acting as a user) for an access token, at POST https://oauth2.googleapis.com/token with grant_type urn:ietf:params:oauth:grant-type:jwt-bearer.",
    method: 'POST',
    idempotency: 'natural',
  },
  'files.list': {
    purpose: 'Lists files matching a query, a page at a time (nextPageToken).',
    method: 'GET',
    path: '/drive/v3/files',
    idempotency: 'natural',
  },
  'files.get': {
    purpose: "Reads one file's metadata.",
    method: 'GET',
    path: '/drive/v3/files/{fileId}',
    idempotency: 'natural',
  },
  'files.download': {
    purpose: "Downloads a stored file's content (alt=media). Google Docs, Sheets and Slides have none: export them.",
    method: 'GET',
    path: '/drive/v3/files/{fileId}',
    idempotency: 'natural',
  },
  'files.export': {
    purpose: 'Exports a Google Doc, Sheet, Slides or Drawing in another format (PDF, CSV, ...), up to 10 MB.',
    method: 'GET',
    path: '/drive/v3/files/{fileId}/export',
    idempotency: 'natural',
  },
  'files.upload': {
    purpose: 'Uploads a file with its metadata: multipart up to 5 MB, a resumable session (started, then the content in one PUT) above that.',
    method: 'POST',
    path: '/upload/drive/v3/files',
    idempotency: 'none',
  },
  'folders.create': {
    purpose: 'Creates a folder (a file with the mimeType application/vnd.google-apps.folder).',
    method: 'POST',
    path: '/drive/v3/files',
    idempotency: 'none',
  },
  'files.update': {
    purpose: "Changes a file's metadata, or moves it (addParents, removeParents).",
    method: 'PATCH',
    path: '/drive/v3/files/{fileId}',
    idempotency: 'natural',
  },
  'files.trash': {
    purpose: 'Moves a file to the trash (files.update with trashed: true), where it can be restored.',
    method: 'PATCH',
    path: '/drive/v3/files/{fileId}',
    idempotency: 'natural',
  },
  'files.delete': {
    purpose: 'Deletes a file for good, skipping the trash.',
    method: 'DELETE',
    path: '/drive/v3/files/{fileId}',
    idempotency: 'natural',
  },
  'permissions.create': {
    purpose: 'Shares a file with a user, a group, a domain or anyone with the link.',
    method: 'POST',
    path: '/drive/v3/files/{fileId}/permissions',
    idempotency: 'none',
  },
  'changes.getStartPageToken': {
    purpose: 'The page token for changes from now on: store it, and list changes since it later.',
    method: 'GET',
    path: '/drive/v3/changes/startPageToken',
    idempotency: 'natural',
  },
  'changes.list': {
    purpose: 'Lists changes since a page token, a page at a time; the last page carries newStartPageToken.',
    method: 'GET',
    path: '/drive/v3/changes',
    idempotency: 'natural',
  },
  'changes.watch': {
    purpose: "Starts a push channel: Google posts to the app's address when anything changes, until the channel expires (at most a week).",
    method: 'POST',
    path: '/drive/v3/changes/watch',
    idempotency: 'none',
  },
  'channels.stop': {
    purpose: 'Stops a push channel, by its id and resourceId.',
    method: 'POST',
    path: '/drive/v3/channels/stop',
    idempotency: 'natural',
  },
} as const;
export type GoogleDriveOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  rateLimitExceeded: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  userRateLimitExceeded: {
    category: 'rate-limited',
    reason: 'rate-limited',
  },
  sharingRateLimitExceeded: {
    category: 'rate-limited',
    reason: 'sharing-rate-limited',
  },
  dailyLimitExceeded: {
    category: 'rate-limited',
    reason: 'daily-limit-exceeded',
  },
  authError: {
    category: 'unauthorized',
    reason: 'unauthorized',
  },
  notFound: {
    category: 'not-found',
    reason: 'not-found',
  },
  insufficientFilePermissions: {
    category: 'forbidden',
    reason: 'insufficient-permissions',
  },
  appNotAuthorizedToFile: {
    category: 'forbidden',
    reason: 'app-not-authorized',
  },
  domainPolicy: {
    category: 'forbidden',
    reason: 'domain-policy',
  },
  teamDriveMembershipRequired: {
    category: 'forbidden',
    reason: 'shared-drive-membership-required',
  },
  storageQuotaExceeded: {
    category: 'invalid-request',
    reason: 'storage-quota-exceeded',
  },
  teamDriveFileLimitExceeded: {
    category: 'invalid-request',
    reason: 'shared-drive-full',
  },
  fileNotDownloadable: {
    category: 'invalid-request',
    reason: 'not-downloadable',
  },
  fileNotExportable: {
    category: 'invalid-request',
    reason: 'not-exportable',
  },
  invalid_grant: {
    category: 'unauthorized',
    reason: 'invalid-grant',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  unauthorized_client: {
    category: 'forbidden',
    reason: 'delegation-not-authorized',
  },
  access_denied: {
    category: 'forbidden',
    reason: 'scope-not-authorized',
  },
  admin_policy_enforced: {
    category: 'forbidden',
    reason: 'admin-policy',
  },
};

/** How its webhooks are signed, and the events it sends. */
export const webhookSignature = {
  scheme: 'shared-secret',
  header: 'X-Goog-Channel-Token',
  secretSetting: 'channelToken',
  description: "Drive's push notifications aren't signed. The X-Goog-Channel-Token header carries back the token the app set when it started the channel; compare it with the channel token in constant time. The body is empty: the channel and what happened are in the X-Goog-Channel-ID, X-Goog-Resource-ID, X-Goog-Resource-State, X-Goog-Message-Number, X-Goog-Changed and X-Goog-Channel-Expiration headers.",
} as const;
export const webhookEvents = ['sync', 'change'] as const;
export type GoogleDriveWebhookEvent = (typeof webhookEvents)[number];
