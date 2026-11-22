import { randomUUID } from 'node:crypto';
import { ConfigError, type Context, fromZodError } from '@mariachi/core';
import { type ProviderAttempt, type ProviderDeps, type ProviderRequest, callProvider, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { GoogleDriveError, failedResponse, failure } from './errors';
import { type GoogleDriveConfig, type GoogleDriveOperation, configSchema, provider } from './generated';
import {
  type Change,
  ChangePage,
  Channel,
  CreateFolderInput,
  CreatePermissionInput,
  DriveFile,
  ExportInput,
  FILE_FIELDS,
  FOLDER_MIME_TYPE,
  type FileContent,
  FileInput,
  FilePage,
  ListChangesInput,
  ListFilesInput,
  Permission,
  StartChannelInput,
  StartPageToken,
  StopChannelInput,
  UpdateFileInput,
  UploadInput,
} from './schemas';
import { DRIVE_SCOPE, parseServiceAccountKey, serviceAccountTokens } from './service-account';

export interface GoogleDriveDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
  /**
   * Each user's own Drive: the signed-in user's Google access token for this call, from wherever the app keeps
   * it (refreshed by the app). Give this, or the `serviceAccountJson` setting, not both: build one client for
   * each.
   */
  accessToken?: (ctx: Context) => Promise<string>;
  /** The service account's scope. `https://www.googleapis.com/auth/drive` by default. */
  scope?: string;
}

/** Up to this size an upload is one multipart request; above it, a resumable session. */
export const MULTIPART_LIMIT_BYTES = 5 * 1024 * 1024;
/** Drive keeps a change channel for at most a week. */
export const MAX_CHANNEL_MS = 7 * 24 * 60 * 60_000;

/**
 * The Google Drive client: each operation takes `ctx` first, checks its input and Drive's answer, and makes one
 * span (`google-drive files.list`). Build it once at startup and share it.
 *
 * Two ways in, one client:
 * - **The app's own Drive:** the `serviceAccountJson` setting. Its signed JWT is exchanged for an access token,
 *   cached until shortly before it expires. A service account has no storage of its own: upload into a shared
 *   drive it's a member of (`folderId`), or act as a Workspace user (`impersonate`, domain-wide delegation).
 * - **Each user's Drive:** `deps.accessToken(ctx)`, the user's own token from the app's OAuth connection.
 *
 * ```ts
 * const drive = createGoogleDrive(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const file = await drive.files.upload(ctx, { name: 'report.pdf', mimeType: 'application/pdf', content: bytes });
 * ```
 */
export function createGoogleDrive(config: GoogleDriveConfig, deps: GoogleDriveDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = provider.baseUrl;
  const server = new URL(base).host;
  const doFetch = deps.fetch ?? fetch;

  if (deps.accessToken && cfg.serviceAccountJson) {
    throw new ConfigError('google-drive/two-credentials', "Give a Google Drive client either a service account key or users' access tokens, not both: build one client for each");
  }
  if (!deps.accessToken && !cfg.serviceAccountJson) {
    throw new ConfigError('google-drive/no-credentials', "Set GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON for the app's own Drive, or pass accessToken for each user's");
  }
  if (deps.accessToken && cfg.impersonate) {
    throw new ConfigError('google-drive/impersonate-needs-service-account', 'GOOGLE_DRIVE_IMPERSONATE is for a service account with domain-wide delegation, not for user tokens');
  }
  if (cfg.channelToken && cfg.channelToken.length > 256) {
    throw new ConfigError('google-drive/invalid-channel-token', 'GOOGLE_DRIVE_CHANNEL_TOKEN is longer than the 256 characters Drive keeps');
  }
  const tokens = cfg.serviceAccountJson
    ? serviceAccountTokens(parseServiceAccountKey(cfg.serviceAccountJson), { scope: deps.scope ?? DRIVE_SCOPE, subject: cfg.impersonate, deps })
    : undefined;

  async function authorization(ctx: Context): Promise<string> {
    const token = tokens ? await tokens.get(ctx) : await deps.accessToken!(ctx);
    if (typeof token !== 'string' || !token) {
      throw new GoogleDriveError('google-drive/no-access-token', 'No Google access token for this call', { category: 'unauthorized' });
    }
    return `Bearer ${token}`;
  }

  /** A service account's token Drive refused (revoked, or a key rotated) is forgotten, so the next call gets a new one. */
  function refused(error: unknown): never {
    if (tokens && error instanceof GoogleDriveError && error.category === 'unauthorized') tokens.invalidate();
    throw error;
  }

  const callOf = (operation: GoogleDriveOperation, method: string) => ({ integration: provider.id, operation, category: provider.category, server, method });

  async function call<T>(
    ctx: Context,
    operation: GoogleDriveOperation,
    request: Omit<ProviderRequest, 'url' | 'headers'> & { path: string },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options: { repeatable?: boolean } = {},
  ): Promise<T> {
    const { path, ...rest } = request;
    const headers = { authorization: await authorization(ctx) };
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers },
      { schema, error: GoogleDriveError, failure, deps: options.repeatable ? { ...deps, retry: { unsafe: false, ...deps.retry } } : deps },
    ).catch(refused);
  }

  /** A call whose body or answer isn't JSON (content up or down), through `callProvider` with the same span and errors. */
  async function raw<T>(ctx: Context, operation: GoogleDriveOperation, method: string, unsafe: boolean, fn: (authorization: string, attempt: ProviderAttempt) => Promise<T>): Promise<T> {
    const auth = await authorization(ctx);
    return callProvider(ctx, callOf(operation, method), (attempt) => fn(auth, attempt), { ...deps, retry: { attempts: 3, unsafe, ...deps.retry } }).catch(refused);
  }

  async function send(attempt: ProviderAttempt, operation: string, url: string, init: RequestInit): Promise<Response> {
    const response = await doFetch(url, init);
    attempt.setStatusCode(response.status);
    if (!response.ok) throw await failedResponse(response, operation);
    return response;
  }

  async function content(attempt: ProviderAttempt, operation: string, url: string, authorization: string): Promise<FileContent> {
    const response = await send(attempt, operation, url, { method: 'GET', headers: { authorization } });
    return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get('content-type') ?? 'application/octet-stream' };
  }

  async function answer<T>(response: Response, operation: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    let body: unknown;
    try {
      body = JSON.parse(await response.text());
    } catch {
      body = undefined;
    }
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new GoogleDriveError(`${provider.id}/invalid-response`, `${provider.id} ${operation} answered in an unexpected shape`, {
        category: 'unavailable',
        status: response.status,
        details: { issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.code })) },
      });
    }
    return parsed.data;
  }

  /** Shared drives are always supported: without it, a file in one is "not found". */
  const allDrives = { supportsAllDrives: true } as const;
  const corpora = (i: { driveId?: string; allDrives?: boolean }) =>
    i.driveId ? { corpora: 'drive', driveId: i.driveId, includeItemsFromAllDrives: true } : i.allDrives ? { corpora: 'allDrives', includeItemsFromAllDrives: true } : {};
  const parentOf = (parentId: string | undefined) => {
    const parent = parentId ?? cfg.folderId;
    return parent ? [parent] : undefined;
  };

  const files = {
    /** One page of the files matching `q` (built with `driveQuery`). The next page is `nextPageToken`. */
    async list(ctx: Context, input: ListFilesInput = {}) {
      const i = parse(ListFilesInput, input);
      const query = { q: i.q?.toString(), pageSize: i.pageSize, pageToken: i.pageToken, orderBy: i.orderBy, ...corpora(i), ...allDrives, fields: `nextPageToken,incompleteSearch,files(${i.fields ?? FILE_FIELDS})` };
      return call(ctx, 'files.list', { method: 'GET', path: '/drive/v3/files', query }, FilePage);
    },
    /** Every file matching `input`, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: Omit<ListFilesInput, 'pageToken'> = {}): AsyncGenerator<DriveFile> {
      let pageToken: string | undefined;
      do {
        const page = await files.list(ctx, { ...input, pageSize: input.pageSize ?? 1000, pageToken });
        yield* page.files;
        pageToken = page.nextPageToken;
      } while (pageToken);
    },
    /** One file's metadata. */
    async get(ctx: Context, input: z.input<typeof FileInput>) {
      const i = parse(FileInput, input);
      return call(ctx, 'files.get', { method: 'GET', path: `/drive/v3/files/${segment(i.fileId)}`, query: { ...allDrives, fields: i.fields ?? FILE_FIELDS } }, DriveFile);
    },
    /**
     * A stored file's content, in memory. A Google Doc, Sheet or Slides has none to download (`google-drive/not-downloadable`):
     * use `export`.
     */
    async download(ctx: Context, input: { fileId: string }): Promise<FileContent> {
      const i = parse(FileInput, input);
      const url = `${base}/drive/v3/files/${segment(i.fileId)}?alt=media&supportsAllDrives=true`;
      return raw(ctx, 'files.download', 'GET', false, (auth, attempt) => content(attempt, 'files.download', url, auth));
    },
    /** A Google Doc, Sheet, Slides or Drawing in another format (`EXPORT_MIME_TYPES`), up to 10 MB. */
    async export(ctx: Context, input: z.input<typeof ExportInput>): Promise<FileContent> {
      const i = parse(ExportInput, input);
      const url = `${base}/drive/v3/files/${segment(i.fileId)}/export?mimeType=${encodeURIComponent(i.mimeType)}`;
      return raw(ctx, 'files.export', 'GET', false, (auth, attempt) => content(attempt, 'files.export', url, auth));
    },
    /**
     * Uploads a file into `parentId`, or the `folderId` setting. Up to 5 MB it's one multipart request; above, a
     * resumable session given the whole content in one PUT. Drive takes no idempotency key, so an upload is
     * retried only after a rate limit: tag it with `appProperties` and look before uploading again.
     */
    async upload(ctx: Context, input: UploadInput) {
      const i = parse(UploadInput, input);
      const bytes = typeof i.content === 'string' ? new TextEncoder().encode(i.content) : i.content;
      const metadata = { name: i.name, mimeType: i.mimeType, parents: parentOf(i.parentId), description: i.description, appProperties: i.appProperties };
      const fields = encodeURIComponent(i.fields ?? FILE_FIELDS);
      return raw(ctx, 'files.upload', 'POST', true, async (authorization, attempt) => {
        if (bytes.byteLength <= MULTIPART_LIMIT_BYTES) {
          const { body, boundary } = multipart(metadata, i.mimeType, bytes);
          const response = await send(attempt, 'files.upload', `${base}/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=${fields}`, {
            method: 'POST',
            headers: { authorization, 'content-type': `multipart/related; boundary=${boundary}` },
            body: body as NonNullable<RequestInit['body']>,
          });
          return answer(response, 'files.upload', DriveFile);
        }
        const started = await send(attempt, 'files.upload', `${base}/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=${fields}`, {
          method: 'POST',
          headers: { authorization, 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-type': i.mimeType, 'x-upload-content-length': String(bytes.byteLength) },
          body: JSON.stringify(metadata),
        });
        const session = started.headers.get('location');
        if (!session) throw new GoogleDriveError(`${provider.id}/invalid-response`, `${provider.id} files.upload gave no upload session`, { category: 'unavailable', status: started.status });
        const response = await send(attempt, 'files.upload', session, { method: 'PUT', headers: { 'content-type': i.mimeType }, body: bytes as NonNullable<RequestInit['body']> });
        return answer(response, 'files.upload', DriveFile);
      });
    },
    /** Changes a file's name, description, star or `appProperties`, or moves it (`addParent`, `removeParent`). */
    async update(ctx: Context, input: UpdateFileInput) {
      const i = parse(UpdateFileInput, input);
      return call(
        ctx,
        'files.update',
        {
          method: 'PATCH',
          path: `/drive/v3/files/${segment(i.fileId)}`,
          query: { addParents: i.addParent, removeParents: i.removeParent, ...allDrives, fields: i.fields ?? FILE_FIELDS },
          json: { name: i.name, description: i.description, starred: i.starred, appProperties: i.appProperties },
        },
        DriveFile,
        { repeatable: true },
      );
    },
    /** Moves a file to the trash, where its owner can restore it. */
    async trash(ctx: Context, input: { fileId: string }) {
      const i = parse(FileInput, input);
      return call(ctx, 'files.trash', { method: 'PATCH', path: `/drive/v3/files/${segment(i.fileId)}`, query: { ...allDrives, fields: FILE_FIELDS }, json: { trashed: true } }, DriveFile, { repeatable: true });
    },
    /** Deletes a file for good, skipping the trash. */
    async delete(ctx: Context, input: { fileId: string }) {
      const i = parse(FileInput, input);
      await call(ctx, 'files.delete', { method: 'DELETE', path: `/drive/v3/files/${segment(i.fileId)}`, query: allDrives }, z.unknown());
    },
  };

  const folders = {
    /** Creates a folder in `parentId`, or the `folderId` setting. */
    async create(ctx: Context, input: CreateFolderInput) {
      const i = parse(CreateFolderInput, input);
      return call(
        ctx,
        'folders.create',
        {
          method: 'POST',
          path: '/drive/v3/files',
          query: { ...allDrives, fields: i.fields ?? FILE_FIELDS },
          json: { name: i.name, mimeType: FOLDER_MIME_TYPE, parents: parentOf(i.parentId), description: i.description, appProperties: i.appProperties },
        },
        DriveFile,
      );
    },
  };

  const permissions = {
    /** Shares a file: with a user or group by email, a whole domain, or anyone with the link. */
    async create(ctx: Context, input: CreatePermissionInput) {
      const i = parse(CreatePermissionInput, input);
      return call(
        ctx,
        'permissions.create',
        {
          method: 'POST',
          path: `/drive/v3/files/${segment(i.fileId)}/permissions`,
          query: { sendNotificationEmail: i.sendNotificationEmail, emailMessage: i.emailMessage, ...allDrives },
          json: { type: i.type, role: i.role, emailAddress: i.emailAddress, domain: i.domain, allowFileDiscovery: i.allowFileDiscovery, expirationTime: i.expirationTime },
        },
        Permission,
      );
    },
  };

  const changes = {
    /** The token for changes from now on. Store it; list the changes since it later. */
    async getStartPageToken(ctx: Context, input: { driveId?: string } = {}) {
      const i = parse(z.object({ driveId: z.string().min(1).optional() }).strict(), input);
      return call(ctx, 'changes.getStartPageToken', { method: 'GET', path: '/drive/v3/changes/startPageToken', query: { driveId: i.driveId, ...allDrives } }, StartPageToken).then((r) => r.startPageToken);
    },
    /** One page of changes since `pageToken`. The last page carries `newStartPageToken`. */
    async list(ctx: Context, input: ListChangesInput) {
      const i = parse(ListChangesInput, input);
      const query = {
        pageToken: i.pageToken,
        pageSize: i.pageSize,
        includeRemoved: i.includeRemoved,
        ...(i.driveId ? { driveId: i.driveId, includeItemsFromAllDrives: true } : i.allDrives ? { includeItemsFromAllDrives: true } : {}),
        ...allDrives,
        fields: `nextPageToken,newStartPageToken,changes(changeType,removed,fileId,driveId,time,file(${i.fields ?? FILE_FIELDS}))`,
      };
      return call(ctx, 'changes.list', { method: 'GET', path: '/drive/v3/changes', query }, ChangePage);
    },
    /**
     * Every change since `pageToken`, and the token to store for next time. What a notification's job calls:
     * notifications carry no file data.
     */
    async since(ctx: Context, input: ListChangesInput): Promise<{ changes: Change[]; newStartPageToken: string }> {
      const out: Change[] = [];
      let pageToken = input.pageToken;
      for (;;) {
        const page = await changes.list(ctx, { ...input, pageSize: input.pageSize ?? 1000, pageToken });
        out.push(...page.changes);
        if (page.newStartPageToken) return { changes: out, newStartPageToken: page.newStartPageToken };
        if (!page.nextPageToken) throw new GoogleDriveError(`${provider.id}/invalid-response`, `${provider.id} changes.list gave neither a next page nor a new start token`, { category: 'unavailable' });
        pageToken = page.nextPageToken;
      }
    },
  };

  const channels = {
    /**
     * Starts a push channel on changes since `pageToken`: Google posts to `address` with the `channelToken`
     * setting in `X-Goog-Channel-Token`, until `expiresAt` (a week by default, Drive's most). Keep the answer's
     * `id`, `resourceId` and `expiration`: renew before it expires (start a new one, then stop this one).
     */
    async start(ctx: Context, input: StartChannelInput) {
      const i = parse(StartChannelInput, input);
      if (!cfg.channelToken) throw new GoogleDriveError('google-drive/no-channel-token', 'Set the channel token (GOOGLE_DRIVE_CHANNEL_TOKEN) before starting a channel', { category: 'invalid-request' });
      const expiresAt = i.expiresAt?.getTime() ?? (deps.now ?? Date.now)() + MAX_CHANNEL_MS;
      return call(
        ctx,
        'changes.watch',
        {
          method: 'POST',
          path: '/drive/v3/changes/watch',
          query: { pageToken: i.pageToken, ...(i.driveId ? { driveId: i.driveId, includeItemsFromAllDrives: true } : i.allDrives ? { includeItemsFromAllDrives: true } : {}), ...allDrives },
          json: { id: i.id ?? randomUUID(), type: 'web_hook', address: i.address, token: cfg.channelToken, expiration: String(expiresAt) },
        },
        Channel,
      );
    },
    /**
     * Stops a channel. A channel started with a user's token can only be stopped with that user's token; one
     * started by a service account, by the same project.
     */
    async stop(ctx: Context, input: StopChannelInput) {
      const i = parse(StopChannelInput, input);
      await call(ctx, 'channels.stop', { method: 'POST', path: '/drive/v3/channels/stop', json: { id: i.id, resourceId: i.resourceId } }, z.unknown(), { repeatable: true });
    },
  };

  return { files, folders, permissions, changes, channels };
}

export type GoogleDrive = ReturnType<typeof createGoogleDrive>;

/**
 * Whether a channel expires within `withinMs` (a day by default): what the renewal job checks for each channel it
 * stored. Renew by starting a new channel from the stored page token, then stopping the old one.
 */
export function channelNeedsRenewal(channel: { expiration?: string | number }, options: { withinMs?: number; now?: number } = {}): boolean {
  const expiration = Number(channel.expiration);
  if (!Number.isFinite(expiration)) return true;
  return expiration - (options.now ?? Date.now()) <= (options.withinMs ?? 24 * 60 * 60_000);
}

/** The `multipart/related` body Drive's multipart upload takes: the metadata as JSON, then the content. */
function multipart(metadata: Record<string, unknown>, mimeType: string, bytes: Uint8Array): { body: Uint8Array; boundary: string } {
  const boundary = `mariachi-${randomUUID()}`;
  const encoder = new TextEncoder();
  const head = encoder.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`);
  const tail = encoder.encode(`\r\n--${boundary}--\r\n`);
  const body = new Uint8Array(head.byteLength + bytes.byteLength + tail.byteLength);
  body.set(head, 0);
  body.set(bytes, head.byteLength);
  body.set(tail, head.byteLength + bytes.byteLength);
  return { body, boundary };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Google Drive input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
