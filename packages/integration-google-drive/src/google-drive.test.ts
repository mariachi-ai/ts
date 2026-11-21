import { createContext } from '@mariachi/core';
import { settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch, type ScriptedResponse } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { exportPKCS8, exportSPKI, generateKeyPair, importSPKI, jwtVerify } from 'jose';
import { beforeAll, describe, expect, it } from 'vitest';
import { channelNeedsRenewal, createGoogleDrive } from './client';
import { GoogleDriveError } from './errors';
import { settings } from './generated';
import { driveQuery } from './query';
import { fakeGoogleDrive, googleDriveNotification } from './testing';
import { GoogleDriveNotification, googleDriveChannelAuth, googleDriveEventType, isDriveChange } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const noWait = { sleep: async () => {} };

let serviceAccountJson: string;
let publicKey: string;
beforeAll(async () => {
  const pair = await generateKeyPair('RS256', { extractable: true });
  publicKey = await exportSPKI(pair.publicKey);
  serviceAccountJson = JSON.stringify({ type: 'service_account', client_email: 'files@app-project.iam.gserviceaccount.com', private_key_id: 'key-1', private_key: await exportPKCS8(pair.privateKey) });
});

const token = (accessToken = 'ya29.token', expiresIn = 3600): ScriptedResponse => ({ json: { access_token: accessToken, expires_in: expiresIn, token_type: 'Bearer' } });
const file = (id: string, extra: Record<string, unknown> = {}) => ({ id, name: `${id}.pdf`, mimeType: 'application/pdf', ...extra });

/** `scriptedFetch` records string bodies only; this keeps every request's body, bytes included. */
function recording(...responses: ScriptedResponse[]) {
  const scripted = scriptedFetch(...responses);
  const bodies: unknown[] = [];
  const fn = (async (input: string | URL | Request, init?: RequestInit) => {
    bodies.push(init?.body);
    return scripted(input, init);
  }) as typeof fetch;
  return Object.assign(fn, { requests: scripted.requests, bodies });
}

describe("the app's own Drive (a service account)", () => {
  it('signs a JWT, exchanges it once, and lists with the token: one span per call, nothing sensitive on them', async () => {
    const fetch = scriptedFetch(token(), { json: { files: [file('a')], nextPageToken: 'p2' } }, { json: { files: [file('b')] } });
    const tracer = new TestTracer();
    const drive = createGoogleDrive({ serviceAccountJson, folderId: 'folder-1' }, { fetch, tracer });
    const first = await drive.files.list(ctx, { q: driveQuery.inFolder('folder-1') });
    await drive.files.list(ctx, { pageToken: first.nextPageToken });

    const [exchange, list] = fetch.requests;
    expect(exchange!.url.href).toBe('https://oauth2.googleapis.com/token');
    expect(exchange!.headers['content-type']).toBe('application/x-www-form-urlencoded');
    const form = new URLSearchParams(exchange!.body);
    expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const { payload, protectedHeader } = await jwtVerify(form.get('assertion')!, await importSPKI(publicKey, 'RS256'), { audience: 'https://oauth2.googleapis.com/token', issuer: 'files@app-project.iam.gserviceaccount.com' });
    expect(protectedHeader).toMatchObject({ alg: 'RS256', typ: 'JWT', kid: 'key-1' });
    expect(payload.scope).toBe('https://www.googleapis.com/auth/drive');
    expect(payload.exp! - payload.iat!).toBe(3600);
    expect(payload.sub).toBeUndefined();

    expect(list!.headers.authorization).toBe('Bearer ya29.token');
    expect(list!.url.origin + list!.url.pathname).toBe('https://www.googleapis.com/drive/v3/files');
    expect(list!.url.searchParams.get('q')).toBe("'folder-1' in parents");
    expect(list!.url.searchParams.get('supportsAllDrives')).toBe('true');
    expect(list!.url.searchParams.get('fields')).toMatch(/^nextPageToken,incompleteSearch,files\(id,name,mimeType,/);
    expect(fetch.requests).toHaveLength(3);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['google-drive auth.token', 'client', 'oauth2.googleapis.com'],
      ['google-drive files.list', 'client', 'www.googleapis.com'],
      ['google-drive files.list', 'client', 'www.googleapis.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('acts as a Workspace user with domain-wide delegation (sub), and renews the token near its expiry', async () => {
    let clock = 1_800_000_000_000;
    const fetch = scriptedFetch(token('first', 3600), { json: file('a') }, token('second', 3600), { json: file('a') });
    const drive = createGoogleDrive({ serviceAccountJson, impersonate: 'ada@example.com' }, { fetch, now: () => clock });
    await drive.files.get(ctx, { fileId: 'a' });
    clock += 56 * 60_000; // inside the last five minutes
    await drive.files.get(ctx, { fileId: 'a' });
    const { payload } = await jwtVerify(new URLSearchParams(fetch.requests[0]!.body).get('assertion')!, await importSPKI(publicKey, 'RS256'), { currentDate: new Date(clock) });
    expect(payload.sub).toBe('ada@example.com');
    expect(fetch.requests.map((r) => r.headers.authorization)).toEqual([undefined, 'Bearer first', undefined, 'Bearer second']);
  });

  it('shares one exchange between calls that arrive together', async () => {
    const fetch = scriptedFetch(token(), { json: file('a') }, { json: file('b') });
    const drive = createGoogleDrive({ serviceAccountJson }, { fetch });
    await Promise.all([drive.files.get(ctx, { fileId: 'a' }), drive.files.get(ctx, { fileId: 'b' })]);
    expect(fetch.requests.filter((r) => r.url.host === 'oauth2.googleapis.com')).toHaveLength(1);
  });

  it('forgets a token Drive refuses, so the next call gets a new one', async () => {
    const fetch = scriptedFetch(token('old'), { status: 401, json: { error: { code: 401, message: 'Invalid Credentials', errors: [{ reason: 'authError' }] } } }, token('new'), { json: file('a') });
    const drive = createGoogleDrive({ serviceAccountJson }, { fetch });
    await expect(drive.files.get(ctx, { fileId: 'a' })).rejects.toMatchObject({ code: 'google-drive/unauthorized', category: 'unauthorized' });
    await drive.files.get(ctx, { fileId: 'a' });
    expect(fetch.requests.at(-1)!.headers.authorization).toBe('Bearer new');
  });

  it("fails with the token endpoint's code when delegation isn't authorized", async () => {
    const fetch = scriptedFetch({ status: 401, json: { error: 'unauthorized_client', error_description: 'Client is unauthorized to retrieve access tokens using this method.' } });
    const err = await createGoogleDrive({ serviceAccountJson, impersonate: 'ada@example.com' }, { fetch }).files.get(ctx, { fileId: 'a' }).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['google-drive/delegation-not-authorized', 'forbidden', 'unauthorized_client']);
    expect(err.message).not.toContain('unauthorized to retrieve');
  });

  it('refuses a key that isn’t one, without echoing it', () => {
    const err = (() => {
      try {
        createGoogleDrive({ serviceAccountJson: '{"private_key":"secret-material"}' });
      } catch (e) {
        return e as Error & { code: string };
      }
    })();
    expect(err?.code).toBe('google-drive/invalid-service-account');
    expect(err?.message).not.toContain('secret-material');
  });
});

describe("each user's own Drive (their token)", () => {
  it("uses the app's token for the user, with no exchange", async () => {
    const fetch = scriptedFetch({ json: file('a') });
    const seen: unknown[] = [];
    const drive = createGoogleDrive({}, { fetch, accessToken: async (c) => { seen.push(c); return 'user-token'; } });
    await drive.files.get(ctx, { fileId: 'a' });
    expect(fetch.requests.map((r) => r.headers.authorization)).toEqual(['Bearer user-token']);
    expect(seen).toEqual([ctx]);
  });

  it('takes one way in: a key or user tokens, and impersonation only with a key', () => {
    expect(() => createGoogleDrive({})).toThrow(expect.objectContaining({ code: 'google-drive/no-credentials' }));
    expect(() => createGoogleDrive({ serviceAccountJson }, { accessToken: async () => 't' })).toThrow(expect.objectContaining({ code: 'google-drive/two-credentials' }));
    expect(() => createGoogleDrive({ impersonate: 'a@b.co' }, { accessToken: async () => 't' })).toThrow(expect.objectContaining({ code: 'google-drive/impersonate-needs-service-account' }));
  });
});

describe('files', () => {
  const user = (fetch: typeof globalThis.fetch, extra: Record<string, string> = {}) => createGoogleDrive({ folderId: 'shared-drive-1', ...extra }, { fetch, accessToken: async () => 'user-token', ...noWait });

  it('retries a 403 rate limit (Drive says so in the reason, not the status) and fails on a full Drive', async () => {
    const fetch = scriptedFetch(
      { status: 403, json: { error: { code: 403, message: 'Rate limit', errors: [{ domain: 'usageLimits', reason: 'userRateLimitExceeded' }] } } },
      { json: file('a') },
      { status: 403, json: { error: { code: 403, message: 'The user’s Drive storage quota has been exceeded.', errors: [{ domain: 'global', reason: 'storageQuotaExceeded' }] } } },
    );
    const tracer = new TestTracer();
    const drive = createGoogleDrive({}, { fetch, tracer, accessToken: async () => 't', ...noWait });
    await drive.files.get(ctx, { fileId: 'a' });
    const err = await drive.folders.create(ctx, { name: 'Reports' }).catch((e) => e);
    expect(err).toBeInstanceOf(GoogleDriveError);
    expect([err.code, err.category, err.providerCode]).toEqual(['google-drive/storage-quota-exceeded', 'invalid-request', 'storageQuotaExceeded']);
    expect(err.message).not.toContain('quota');
    expect(tracer.spans.map((s) => [s.name, s.attributes['mariachi.integration.attempts'], s.attributes['error.type']])).toEqual([
      ['google-drive files.get', 2, undefined],
      ['google-drive folders.create', 1, 'storageQuotaExceeded'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('pages through every file by nextPageToken', async () => {
    const fetch = scriptedFetch({ json: { files: [file('a'), file('b')], nextPageToken: 'n' } }, { json: { files: [file('c')] } });
    const ids: string[] = [];
    for await (const f of user(fetch).files.all(ctx, { q: driveQuery.trashed(false), driveId: 'shared-drive-1' })) ids.push(f.id);
    expect(ids).toEqual(['a', 'b', 'c']);
    const [first, second] = fetch.requests;
    expect(Object.fromEntries(first!.url.searchParams)).toMatchObject({ q: 'trashed = false', pageSize: '1000', corpora: 'drive', driveId: 'shared-drive-1', includeItemsFromAllDrives: 'true' });
    expect(second!.url.searchParams.get('pageToken')).toBe('n');
  });

  it('downloads content and exports a Google Doc as PDF', async () => {
    const tracer = new TestTracer();
    const fetch = scriptedFetch({ text: 'hello', headers: { 'content-type': 'text/plain' } }, { text: '%PDF-1.7', headers: { 'content-type': 'application/pdf' } });
    const drive = createGoogleDrive({}, { fetch, tracer, accessToken: async () => 't' });
    const got = await drive.files.download(ctx, { fileId: 'f1' });
    expect([new TextDecoder().decode(got.bytes), got.contentType]).toEqual(['hello', 'text/plain']);
    const pdf = await drive.files.export(ctx, { fileId: 'doc1', mimeType: 'application/pdf' });
    expect(new TextDecoder().decode(pdf.bytes)).toBe('%PDF-1.7');
    expect(fetch.requests.map((r) => r.url.href)).toEqual([
      'https://www.googleapis.com/drive/v3/files/f1?alt=media&supportsAllDrives=true',
      'https://www.googleapis.com/drive/v3/files/doc1/export?mimeType=application%2Fpdf',
    ]);
    expect(tracer.spans.map((s) => [s.name, s.attributes['http.response.status_code']])).toEqual([['google-drive files.download', 200], ['google-drive files.export', 200]]);
    assertProviderSpans(tracer.spans);
  });

  it("says a Google Doc can't be downloaded, only exported", async () => {
    const fetch = scriptedFetch({ status: 403, json: { error: { code: 403, errors: [{ reason: 'fileNotDownloadable' }] } } });
    await expect(user(fetch).files.download(ctx, { fileId: 'doc1' })).rejects.toMatchObject({ code: 'google-drive/not-downloadable' });
  });

  it('uploads up to 5 MB as one multipart request, into the folder setting', async () => {
    const tracer = new TestTracer();
    const fetch = recording({ json: file('new', { parents: ['shared-drive-1'] }) });
    const created = await createGoogleDrive({ folderId: 'shared-drive-1' }, { fetch, tracer, accessToken: async () => 't' }).files.upload(ctx, { name: 'notes.txt', mimeType: 'text/plain', content: 'hi there', appProperties: { reportId: 'r1' } });
    expect(created.id).toBe('new');
    const [req] = fetch.requests;
    expect(req!.url.searchParams.get('uploadType')).toBe('multipart');
    expect(req!.url.pathname).toBe('/upload/drive/v3/files');
    const boundary = /^multipart\/related; boundary=(.+)$/.exec(req!.headers['content-type']!)![1]!;
    const body = new TextDecoder().decode(fetch.bodies[0] as Uint8Array);
    const parts = body.split(`--${boundary}`);
    expect(parts).toHaveLength(4);
    expect(parts[3]).toBe('--\r\n');
    expect(JSON.parse(parts[1]!.split('\r\n\r\n')[1]!)).toEqual({ name: 'notes.txt', mimeType: 'text/plain', parents: ['shared-drive-1'], appProperties: { reportId: 'r1' } });
    expect(parts[2]).toBe('\r\nContent-Type: text/plain\r\n\r\nhi there\r\n');
    expect(tracer.spans.map((s) => s.name)).toEqual(['google-drive files.upload']);
    assertProviderSpans(tracer.spans);
  });

  it('uploads above 5 MB through a resumable session, in one PUT', async () => {
    const fetch = recording({ headers: { location: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&upload_id=xyz' } }, { json: file('big') });
    const content = new Uint8Array(5 * 1024 * 1024 + 1);
    const created = await user(fetch).files.upload(ctx, { name: 'big.bin', mimeType: 'application/octet-stream', content, parentId: 'folder-2' });
    expect(created.id).toBe('big');
    const [start, put] = fetch.requests;
    expect([start!.method, start!.url.searchParams.get('uploadType'), start!.headers['x-upload-content-length'], start!.headers['x-upload-content-type']]).toEqual(['POST', 'resumable', String(content.byteLength), 'application/octet-stream']);
    expect(start!.json).toEqual({ name: 'big.bin', mimeType: 'application/octet-stream', parents: ['folder-2'] });
    expect([put!.method, put!.url.searchParams.get('upload_id'), put!.headers.authorization]).toEqual(['PUT', 'xyz', undefined]);
    expect((fetch.bodies[1] as Uint8Array).byteLength).toBe(content.byteLength);
  });

  it("doesn't retry an upload after an outage (it may have been made), only after a rate limit", async () => {
    const fetch = scriptedFetch({ status: 503 });
    await expect(user(fetch).files.upload(ctx, { name: 'a', mimeType: 'text/plain', content: 'x' })).rejects.toMatchObject({ category: 'unavailable' });
    expect(fetch.requests).toHaveLength(1);
  });

  it('creates folders, moves, trashes, deletes and shares', async () => {
    const fetch = scriptedFetch({ json: file('folder', { mimeType: 'application/vnd.google-apps.folder' }) }, { json: file('a') }, { json: file('a', { trashed: true }) }, { status: 204 }, { json: { id: 'perm', type: 'user', role: 'reader' } });
    const drive = user(fetch);
    await drive.folders.create(ctx, { name: 'Reports' });
    await drive.files.update(ctx, { fileId: 'a', addParent: 'folder', removeParent: 'shared-drive-1', name: 'Q3.pdf' });
    await drive.files.trash(ctx, { fileId: 'a' });
    await drive.files.delete(ctx, { fileId: 'a' });
    await drive.permissions.create(ctx, { fileId: 'a', type: 'user', role: 'reader', emailAddress: 'ada@example.com', sendNotificationEmail: false });
    const [folder, move, trash, del, share] = fetch.requests;
    expect(folder!.json).toEqual({ name: 'Reports', mimeType: 'application/vnd.google-apps.folder', parents: ['shared-drive-1'] });
    expect([move!.method, move!.url.searchParams.get('addParents'), move!.url.searchParams.get('removeParents'), move!.json]).toEqual(['PATCH', 'folder', 'shared-drive-1', { name: 'Q3.pdf' }]);
    expect(trash!.json).toEqual({ trashed: true });
    expect([del!.method, del!.url.pathname]).toEqual(['DELETE', '/drive/v3/files/a']);
    expect([share!.url.pathname, share!.url.searchParams.get('sendNotificationEmail'), share!.json]).toEqual(['/drive/v3/files/a/permissions', 'false', { type: 'user', role: 'reader', emailAddress: 'ada@example.com' }]);
  });

  it('checks its input before calling', async () => {
    const drive = user(scriptedFetch());
    await expect(drive.permissions.create(ctx, { fileId: 'a', type: 'user', role: 'writer' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(drive.files.list(ctx, { q: "name = 'x'" as never })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(drive.files.get(ctx, { fileId: '' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('driveQuery', () => {
  it("escapes quotes and backslashes, so input can't change the query", () => {
    expect(String(driveQuery.nameContains("quinn's paper\\essay"))).toBe("name contains 'quinn\\'s paper\\\\essay'");
    expect(String(driveQuery.nameIs("x' or name contains '"))).toBe("name = 'x\\' or name contains \\''");
  });

  it('combines terms', () => {
    const q = driveQuery.and(driveQuery.inFolder('f1'), driveQuery.not(driveQuery.isFolder()), driveQuery.or(driveQuery.modifiedAfter(new Date('2026-11-01T00:00:00Z')), driveQuery.appProperty('reportId', 'r1')));
    expect(String(q)).toBe(
      "('f1' in parents) and (not (mimeType = 'application/vnd.google-apps.folder')) and ((modifiedTime > '2026-11-01T00:00:00.000Z') or (appProperties has { key='reportId' and value='r1' }))",
    );
    expect(() => driveQuery.and()).toThrow();
    expect(() => driveQuery.modifiedAfter('not a date')).toThrow();
  });
});

describe('changes and channels', () => {
  const drive = (fetch: typeof globalThis.fetch, channelToken?: string) => createGoogleDrive({ channelToken }, { fetch, accessToken: async () => 't', now: () => 1_800_000_000_000 });

  it('reads every change since the stored token, and the token to store next', async () => {
    const fetch = scriptedFetch(
      { json: { startPageToken: '100' } },
      { json: { changes: [{ changeType: 'file', fileId: 'a', file: file('a') }], nextPageToken: '101' } },
      { json: { changes: [{ changeType: 'file', fileId: 'b', removed: true }], newStartPageToken: '102' } },
    );
    const d = drive(fetch);
    const start = await d.changes.getStartPageToken(ctx);
    const { changes, newStartPageToken } = await d.changes.since(ctx, { pageToken: start });
    expect([changes.map((c) => [c.fileId, c.removed ?? false]), newStartPageToken]).toEqual([[['a', false], ['b', true]], '102']);
    expect(fetch.requests[1]!.url.searchParams.get('pageToken')).toBe('100');
    expect(fetch.requests[2]!.url.searchParams.get('pageToken')).toBe('101');
  });

  it('starts a channel with the token and a week to run, and stops it', async () => {
    const fetch = scriptedFetch({ json: { kind: 'api#channel', id: 'ch-1', resourceId: 'res-1', expiration: '1800604800000' } }, { status: 204 });
    const d = drive(fetch, 'chan-token');
    const channel = await d.channels.start(ctx, { pageToken: '102', address: 'https://app.example.com/webhooks/google-drive/changes', id: 'ch-1' });
    await d.channels.stop(ctx, { id: channel.id, resourceId: channel.resourceId });
    const [watch, stop] = fetch.requests;
    expect([watch!.url.pathname, watch!.url.searchParams.get('pageToken')]).toEqual(['/drive/v3/changes/watch', '102']);
    expect(watch!.json).toEqual({ id: 'ch-1', type: 'web_hook', address: 'https://app.example.com/webhooks/google-drive/changes', token: 'chan-token', expiration: String(1_800_000_000_000 + 7 * 24 * 3600_000) });
    expect([stop!.url.pathname, stop!.json]).toEqual(['/drive/v3/channels/stop', { id: 'ch-1', resourceId: 'res-1' }]);
  });

  it('refuses to start a channel without a token, or to an address that isn’t HTTPS', async () => {
    await expect(drive(scriptedFetch()).channels.start(ctx, { pageToken: '1', address: 'https://app.example.com/h' })).rejects.toMatchObject({ code: 'google-drive/no-channel-token' });
    await expect(drive(scriptedFetch(), 'x').channels.start(ctx, { pageToken: '1', address: 'http://app.example.com/h' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('says when a channel needs renewing', () => {
    const now = 1_800_000_000_000;
    expect(channelNeedsRenewal({ expiration: String(now + 2 * 24 * 3600_000) }, { now })).toBe(false);
    expect(channelNeedsRenewal({ expiration: String(now + 3600_000) }, { now })).toBe(true);
    expect(channelNeedsRenewal({}, { now })).toBe(true);
  });
});

describe('notifications', () => {
  class DriveWebhooks extends WebhookController {
    readonly prefix = 'google-drive';
    readonly auth = googleDriveChannelAuth(['chan-token', 'old-token']);
    init() {
      this.post('changes', { mode: 'direct', procedure: 'documents.driveChanged', eventType: googleDriveEventType }, async (ctx, _body) => GoogleDriveNotification.parse(ctx.identity.metadata));
    }
  }

  it('accepts a notification carrying the channel token, with its span, and refuses one without it', async () => {
    const received: GoogleDriveNotification[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input as GoogleDriveNotification); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new DriveWebhooks());
    const post = (headers: Record<string, string>) => server.inject({ method: 'POST', url: '/google-drive/changes', headers: { 'content-type': 'application/json', 'content-length': '0', ...headers }, payload: '' });

    const sync = googleDriveNotification('chan-token', { channelId: 'ch-1', resourceState: 'sync' });
    const change = googleDriveNotification('old-token', { channelId: 'ch-1', messageNumber: 7 });
    expect((await post(sync.headers)).statusCode).toBe(200);
    expect((await post(change.headers)).statusCode).toBe(200);
    expect(received.map((n) => [n.channelId, n.resourceState, n.messageNumber, isDriveChange(n)])).toEqual([['ch-1', 'sync', 1, false], ['ch-1', 'change', 7, true]]);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['google-drive webhook', 'server', 'sync'], ['google-drive webhook', 'server', 'change']]);

    const forged = googleDriveNotification('guess');
    expect((await post(forged.headers)).statusCode).toBe(401);
    const { 'x-goog-channel-token': _dropped, ...without } = change.headers;
    expect((await post(without)).statusCode).toBe(401);
    expect(received).toHaveLength(2);
  });

  it('needs a token to be configured', () => {
    expect(() => googleDriveChannelAuth('')).toThrow(expect.objectContaining({ code: 'webhooks/invalid-secret' }));
  });
});

describe('settings', () => {
  it('reads from the environment by name, all optional, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON: '{}', GOOGLE_DRIVE_FOLDER_ID: 'f' })[n])).toEqual({ serviceAccountJson: '{}', folderId: 'f' });
    expect(settings.every((s) => s.whereToFind && !s.required)).toBe(true);
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests, with a change log', async () => {
    const fake = fakeGoogleDrive({ folderId: 'root' });
    const start = await fake.changes.getStartPageToken(ctx);
    const up = await fake.files.upload(ctx, { name: 'a.txt', mimeType: 'text/plain', content: 'hello' });
    expect(up.parents).toEqual(['root']);
    expect(new TextDecoder().decode((await fake.files.download(ctx, { fileId: up.id })).bytes)).toBe('hello');
    await fake.files.trash(ctx, { fileId: up.id });
    expect((await fake.files.list(ctx)).files).toEqual([]);
    const { changes, newStartPageToken } = await fake.changes.since(ctx, { pageToken: start });
    expect([changes.map((c) => c.file?.trashed), newStartPageToken]).toEqual([[false, true], '2']);
    await expect(fake.files.get(ctx, { fileId: 'nope' })).rejects.toMatchObject({ code: 'not-found' });
  });
});
