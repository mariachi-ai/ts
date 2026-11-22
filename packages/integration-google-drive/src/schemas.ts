import { z } from 'zod';
import { DriveQuery } from './query';

/**
 * Drive's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field Drive adds
 * doesn't fail the boundary; a field the app relies on that goes missing does.
 */

/** The mimeType of a folder. */
export const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

/**
 * The file fields every call asks for (Drive v3 answers only `id`, `name` and `mimeType` unless asked). Pass
 * `fields` to an operation for others.
 */
export const FILE_FIELDS = 'id,name,mimeType,parents,driveId,size,md5Checksum,createdTime,modifiedTime,trashed,starred,description,webViewLink,appProperties';

export const DriveFile = z
  .object({
    id: z.string(),
    name: z.string(),
    mimeType: z.string(),
    parents: z.array(z.string()).optional(),
    driveId: z.string().optional(),
    /** Bytes, as a string (int64). Absent for Google Docs, Sheets and Slides and for folders. */
    size: z.string().optional(),
    md5Checksum: z.string().optional(),
    createdTime: z.string().optional(),
    modifiedTime: z.string().optional(),
    trashed: z.boolean().optional(),
    starred: z.boolean().optional(),
    description: z.string().optional(),
    webViewLink: z.string().optional(),
    appProperties: z.record(z.string()).optional(),
  })
  .passthrough();
export type DriveFile = z.infer<typeof DriveFile>;

export const FilePage = z
  .object({
    files: z.array(DriveFile).default([]),
    nextPageToken: z.string().optional(),
    /** Some results may be missing: search one drive (`driveId`) rather than all of them. */
    incompleteSearch: z.boolean().optional(),
  })
  .passthrough();
export type FilePage = z.infer<typeof FilePage>;

export const Permission = z
  .object({
    id: z.string(),
    type: z.string().optional(),
    role: z.string().optional(),
  })
  .passthrough();
export type Permission = z.infer<typeof Permission>;

export const Change = z
  .object({
    /** `file` or `drive` (a shared drive itself changed). */
    changeType: z.string().optional(),
    /** The file was deleted, or the app lost access to it: `file` is absent. */
    removed: z.boolean().optional(),
    fileId: z.string().optional(),
    file: DriveFile.optional(),
    driveId: z.string().optional(),
    time: z.string().optional(),
  })
  .passthrough();
export type Change = z.infer<typeof Change>;

export const ChangePage = z
  .object({
    changes: z.array(Change).default([]),
    /** More changes: list again with it. */
    nextPageToken: z.string().optional(),
    /** On the last page only: store it, and list from it next time. */
    newStartPageToken: z.string().optional(),
  })
  .passthrough();
export type ChangePage = z.infer<typeof ChangePage>;

export const StartPageToken = z.object({ startPageToken: z.string() }).passthrough();

export const Channel = z
  .object({
    /** The channel's id, which the app chose. */
    id: z.string(),
    /** Drive's id for what is watched. Keep it with the id: stopping the channel needs both. */
    resourceId: z.string(),
    resourceUri: z.string().optional(),
    /** When it stops, in Unix milliseconds, as a string. */
    expiration: z.string().optional(),
  })
  .passthrough();
export type Channel = z.infer<typeof Channel>;

const Id = z.string().min(1).max(1000);
const Fields = z.string().min(1).max(2000).optional();
/** Drive's `appProperties`: private to the app (its OAuth client), searchable with `driveQuery.appProperty`. */
const AppProperties = z.record(z.string()).optional();

export const ListFilesInput = z
  .object({
    /** Built with `driveQuery`, never from a string: its values are escaped. */
    q: z.instanceof(DriveQuery).optional(),
    /** Up to 1000; Drive may answer with fewer. */
    pageSize: z.number().int().min(1).max(1000).optional(),
    pageToken: z.string().min(1).optional(),
    /** Comma-separated: `modifiedTime desc,name`. */
    orderBy: z.string().regex(/^[A-Za-z_]+( desc)?(,[A-Za-z_]+( desc)?)*$/).optional(),
    /** Search one shared drive. */
    driveId: Id.optional(),
    /** Search My Drive and every shared drive the caller is in, as well. Ignored with `driveId`. */
    allDrives: z.boolean().optional(),
    /** The file fields to read, in place of `FILE_FIELDS`. */
    fields: Fields,
  })
  .strict();

export const FileInput = z.object({ fileId: Id, fields: Fields }).strict();

export const ExportInput = z
  .object({
    fileId: Id,
    /** The format: `application/pdf`, `text/csv` (a Sheet's first sheet only), `text/plain`… See `EXPORT_MIME_TYPES`. */
    mimeType: z.string().min(1),
  })
  .strict();

export const UploadInput = z
  .object({
    name: z.string().min(1),
    /** The content's type: `application/pdf`, `image/png`. */
    mimeType: z.string().min(1),
    content: z.union([z.instanceof(Uint8Array), z.string()]),
    /** The folder (or shared drive) to put it in. Defaults to the `folderId` setting. */
    parentId: Id.optional(),
    description: z.string().optional(),
    appProperties: AppProperties,
    fields: Fields,
  })
  .strict();

export const CreateFolderInput = z
  .object({
    name: z.string().min(1),
    /** Defaults to the `folderId` setting. */
    parentId: Id.optional(),
    description: z.string().optional(),
    appProperties: AppProperties,
    fields: Fields,
  })
  .strict();

export const UpdateFileInput = z
  .object({
    fileId: Id,
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    starred: z.boolean().optional(),
    appProperties: AppProperties,
    /** Move it: the folder to add it to… */
    addParent: Id.optional(),
    /** …and the one to take it out of. */
    removeParent: Id.optional(),
    fields: Fields,
  })
  .strict();

export const CreatePermissionInput = z
  .object({
    fileId: Id,
    /** Who: one user or group (by `emailAddress`), everyone in a `domain`, or `anyone` with the link. */
    type: z.enum(['user', 'group', 'domain', 'anyone']),
    /** `organizer` and `fileOrganizer` apply to shared drives. Transferring ownership isn't offered here. */
    role: z.enum(['organizer', 'fileOrganizer', 'writer', 'commenter', 'reader']),
    emailAddress: z.string().email().optional(),
    domain: z.string().min(1).optional(),
    /** For `domain` and `anyone`: whether it can be found by search, rather than only by its link. */
    allowFileDiscovery: z.boolean().optional(),
    /** For users and groups: when it ends, at most a year out. */
    expirationTime: z.string().datetime({ offset: true }).optional(),
    /** Email users and groups that it was shared with them. Drive's default is true. */
    sendNotificationEmail: z.boolean().optional(),
    emailMessage: z.string().optional(),
  })
  .strict()
  .refine((p) => (p.type === 'user' || p.type === 'group' ? !!p.emailAddress : true), { message: 'a user or group permission needs emailAddress', path: ['emailAddress'] })
  .refine((p) => (p.type === 'domain' ? !!p.domain : true), { message: 'a domain permission needs domain', path: ['domain'] });

export const ListChangesInput = z
  .object({
    /** From `changes.getStartPageToken`, or the `newStartPageToken` stored last time. */
    pageToken: z.string().min(1),
    pageSize: z.number().int().min(1).max(1000).optional(),
    /** The changes of one shared drive. */
    driveId: Id.optional(),
    /** Include changes from My Drive and every shared drive the caller is in. Ignored with `driveId`. */
    allDrives: z.boolean().optional(),
    /** Include files that were deleted or that the app lost access to. Drive's default is true. */
    includeRemoved: z.boolean().optional(),
    fields: Fields,
  })
  .strict();

export const StartChannelInput = z
  .object({
    /** The page token changes are watched from: the one the app has stored. */
    pageToken: z.string().min(1),
    /** Where Google posts the notifications: an HTTPS address with a valid certificate. */
    address: z.string().url().startsWith('https://'),
    /** The channel's id, unique in the project, up to 64 characters. A random UUID by default. */
    id: z.string().min(1).max(64).optional(),
    /** When it stops. Drive allows at most a week for changes, and the default here is that week. */
    expiresAt: z.date().optional(),
    driveId: Id.optional(),
    allDrives: z.boolean().optional(),
  })
  .strict();

export const StopChannelInput = z.object({ id: z.string().min(1), resourceId: z.string().min(1) }).strict();

/** Export formats Drive documents, by kind of document. CSV and TSV hold a Sheet's first sheet only. */
export const EXPORT_MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  text: 'text/plain',
  markdown: 'text/markdown',
  html: 'text/html',
  png: 'image/png',
} as const;

export type ListFilesInput = z.input<typeof ListFilesInput>;
export type UploadInput = z.input<typeof UploadInput>;
export type CreateFolderInput = z.input<typeof CreateFolderInput>;
export type UpdateFileInput = z.input<typeof UpdateFileInput>;
export type CreatePermissionInput = z.input<typeof CreatePermissionInput>;
export type ListChangesInput = z.input<typeof ListChangesInput>;
export type StartChannelInput = z.input<typeof StartChannelInput>;
export type StopChannelInput = z.input<typeof StopChannelInput>;

/** A file's content, as downloaded or exported. */
export interface FileContent {
  bytes: Uint8Array;
  /** As Drive answered it. */
  contentType: string;
}
