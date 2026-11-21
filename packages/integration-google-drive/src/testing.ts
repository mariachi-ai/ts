/**
 * `@mariachi/integration-google-drive/testing`: a Drive for an app's tests, held in memory, with the same shape as
 * `createGoogleDrive`'s client; and a notification to post to the app's endpoint.
 */
import { randomUUID } from 'node:crypto';
import { NotFoundError, ValidationError } from '@mariachi/core';
import type { GoogleDrive } from './client';
import type { Change, Channel, DriveFile, Permission } from './schemas';
import { FOLDER_MIME_TYPE } from './schemas';

export interface FakeGoogleDrive extends GoogleDrive {
  /** Every file, by id, with its content. Trashed files stay, with `trashed: true`. */
  stored: Map<string, { file: DriveFile; bytes: Uint8Array }>;
  permissions_: Map<string, Permission[]>;
  channels_: Map<string, Channel & { address: string; pageToken: string }>;
  /** The change log: a page token is a position in it. */
  log: Change[];
}

/**
 * An in-memory Drive: seed files, then hand it to the code under test in place of the client. `files.list` doesn't
 * read `q`: it lists every file not in the trash (filter `stored` in the test for anything finer).
 */
export function fakeGoogleDrive(seed: { files?: Array<DriveFile & { content?: string }>; folderId?: string } = {}): FakeGoogleDrive {
  const stored = new Map<string, { file: DriveFile; bytes: Uint8Array }>();
  const permissions_ = new Map<string, Permission[]>();
  const channels_ = new Map<string, Channel & { address: string; pageToken: string }>();
  const log: Change[] = [];
  const now = () => new Date().toISOString();
  const encode = (content: string | Uint8Array) => (typeof content === 'string' ? new TextEncoder().encode(content) : content);
  for (const { content, ...file } of seed.files ?? []) stored.set(file.id, { file, bytes: encode(content ?? '') });

  const entry = (fileId: string) => {
    const found = stored.get(fileId);
    if (!found) throw new NotFoundError('google drive file', fileId);
    return found;
  };
  const record = (file: DriveFile, removed = false) => {
    log.push({ changeType: 'file', fileId: file.id, removed, ...(removed ? {} : { file: { ...file } }), time: now() });
  };
  const put = (file: DriveFile, bytes: Uint8Array) => {
    stored.set(file.id, { file, bytes });
    record(file);
    return { ...file };
  };
  const parents = (parentId: string | undefined) => {
    const parent = parentId ?? seed.folderId;
    return parent ? [parent] : undefined;
  };
  const pageOf = (pageToken: string) => {
    const at = Number(pageToken);
    if (!Number.isInteger(at) || at < 0 || at > log.length) throw new ValidationError('Unknown page token');
    return at;
  };

  const fake: FakeGoogleDrive = {
    stored,
    permissions_,
    channels_,
    log,
    files: {
      async list() {
        return { files: [...stored.values()].map((e) => ({ ...e.file })).filter((f) => !f.trashed) };
      },
      async *all(ctx, input = {}) {
        yield* (await fake.files.list(ctx, input)).files;
      },
      async get(_ctx, { fileId }) {
        return { ...entry(fileId).file };
      },
      async download(_ctx, { fileId }) {
        const { file, bytes } = entry(fileId);
        return { bytes, contentType: file.mimeType };
      },
      async export(_ctx, { fileId, mimeType }) {
        return { bytes: entry(fileId).bytes, contentType: mimeType };
      },
      async upload(_ctx, input) {
        const bytes = encode(input.content);
        const file: DriveFile = { id: randomUUID(), name: input.name, mimeType: input.mimeType, parents: parents(input.parentId), size: String(bytes.byteLength), description: input.description, appProperties: input.appProperties, createdTime: now(), modifiedTime: now(), trashed: false };
        return put(file, bytes);
      },
      async update(_ctx, input) {
        const { file, bytes } = entry(input.fileId);
        const moved = (file.parents ?? []).filter((p) => p !== input.removeParent).concat(input.addParent ? [input.addParent] : []);
        const next: DriveFile = {
          ...file,
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.starred !== undefined ? { starred: input.starred } : {}),
          ...(input.appProperties ? { appProperties: { ...file.appProperties, ...input.appProperties } } : {}),
          parents: moved,
          modifiedTime: now(),
        };
        return put(next, bytes);
      },
      async trash(_ctx, { fileId }) {
        const { file, bytes } = entry(fileId);
        return put({ ...file, trashed: true, modifiedTime: now() }, bytes);
      },
      async delete(_ctx, { fileId }) {
        const { file } = entry(fileId);
        stored.delete(fileId);
        record(file, true);
      },
    },
    folders: {
      async create(_ctx, input) {
        return put({ id: randomUUID(), name: input.name, mimeType: FOLDER_MIME_TYPE, parents: parents(input.parentId), description: input.description, appProperties: input.appProperties, createdTime: now(), trashed: false }, new Uint8Array());
      },
    },
    permissions: {
      async create(_ctx, input) {
        entry(input.fileId);
        const permission: Permission = { id: randomUUID(), type: input.type, role: input.role, ...(input.emailAddress ? { emailAddress: input.emailAddress } : {}), ...(input.domain ? { domain: input.domain } : {}) };
        permissions_.set(input.fileId, [...(permissions_.get(input.fileId) ?? []), permission]);
        return permission;
      },
    },
    changes: {
      async getStartPageToken() {
        return String(log.length);
      },
      async list(_ctx, input) {
        const from = pageOf(input.pageToken);
        const size = input.pageSize ?? 100;
        const changes = log.slice(from, from + size).filter((c) => input.includeRemoved !== false || !c.removed);
        const end = Math.min(log.length, from + size);
        return end < log.length ? { changes, nextPageToken: String(end) } : { changes, newStartPageToken: String(log.length) };
      },
      async since(ctx, input) {
        const changes: Change[] = [];
        let pageToken = input.pageToken;
        for (;;) {
          const page = await fake.changes.list(ctx, { ...input, pageToken });
          changes.push(...page.changes);
          if (page.newStartPageToken) return { changes, newStartPageToken: page.newStartPageToken };
          pageToken = page.nextPageToken!;
        }
      },
    },
    channels: {
      async start(_ctx, input) {
        pageOf(input.pageToken);
        const channel = { id: input.id ?? randomUUID(), resourceId: randomUUID(), expiration: String((input.expiresAt ?? new Date(Date.now() + 7 * 24 * 3600_000)).getTime()), address: input.address, pageToken: input.pageToken };
        channels_.set(channel.id, channel);
        const { address: _address, pageToken: _pageToken, ...answer } = channel;
        return answer;
      },
      async stop(_ctx, { id, resourceId }) {
        if (channels_.get(id)?.resourceId === resourceId) channels_.delete(id);
      },
    },
  };
  return fake;
}

/**
 * The headers Google would send for a notification on a channel (the body is empty), to post to the app's
 * endpoint with `WebhookServer.inject`.
 */
export function googleDriveNotification(
  token: string,
  options: { channelId?: string; resourceId?: string; resourceState?: string; messageNumber?: number } = {},
): { rawBody: string; headers: Record<string, string> } {
  const state = options.resourceState ?? 'change';
  return {
    rawBody: '',
    headers: {
      'x-goog-channel-id': options.channelId ?? 'channel-1',
      'x-goog-channel-token': token,
      'x-goog-channel-expiration': 'Tue, 01 Dec 2026 10:00:00 GMT',
      'x-goog-resource-id': options.resourceId ?? 'resource-1',
      'x-goog-resource-uri': 'https://www.googleapis.com/drive/v3/changes',
      'x-goog-resource-state': state,
      'x-goog-message-number': String(options.messageNumber ?? (state === 'sync' ? 1 : 2)),
    },
  };
}
