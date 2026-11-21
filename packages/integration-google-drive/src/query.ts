import { ValidationError } from '@mariachi/core';

/**
 * A Drive search query (`files.list`'s `q`), built from terms whose values are quoted and escaped. Build it with
 * `driveQuery`; `files.list` takes nothing else, so a name a user typed can never change what the query means.
 */
export class DriveQuery {
  /** @internal Use `driveQuery`. */
  constructor(private readonly text: string) {}

  toString(): string {
    return this.text;
  }
}

/** A value as a Drive query string literal: in single quotes, with `\` and `'` escaped by a backslash. */
export function quoteDriveValue(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function time(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new ValidationError('A Drive query time must be a date or an ISO 8601 string');
  return quoteDriveValue(date.toISOString());
}

const term = (text: string) => new DriveQuery(text);

function joined(op: 'and' | 'or', parts: DriveQuery[]): DriveQuery {
  if (parts.length === 0) throw new ValidationError(`driveQuery.${op} needs at least one term`);
  if (parts.some((p) => !(p instanceof DriveQuery))) throw new ValidationError(`driveQuery.${op} takes driveQuery terms only`);
  return parts.length === 1 ? parts[0]! : term(parts.map((p) => `(${p})`).join(` ${op} `));
}

/**
 * Drive's search terms, each escaping its value. Combine them with `and`, `or` and `not`:
 *
 * ```ts
 * const q = driveQuery.and(driveQuery.inFolder(folderId), driveQuery.nameContains(search), driveQuery.trashed(false));
 * await drive.files.list(ctx, { q });
 * ```
 */
export const driveQuery = {
  /** The file's name is exactly this. */
  nameIs: (name: string) => term(`name = ${quoteDriveValue(name)}`),
  /** The file's name contains this. */
  nameContains: (text: string) => term(`name contains ${quoteDriveValue(text)}`),
  /** The name, description or content contains this. */
  fullTextContains: (text: string) => term(`fullText contains ${quoteDriveValue(text)}`),
  mimeTypeIs: (mimeType: string) => term(`mimeType = ${quoteDriveValue(mimeType)}`),
  mimeTypeIsNot: (mimeType: string) => term(`mimeType != ${quoteDriveValue(mimeType)}`),
  /** Folders only. */
  isFolder: () => term(`mimeType = 'application/vnd.google-apps.folder'`),
  /** Directly in this folder (or at the top of this shared drive). */
  inFolder: (folderId: string) => term(`${quoteDriveValue(folderId)} in parents`),
  trashed: (trashed: boolean) => term(`trashed = ${trashed}`),
  starred: (starred: boolean) => term(`starred = ${starred}`),
  /** Shared with the caller, rather than in their own Drive. */
  sharedWithMe: () => term('sharedWithMe'),
  modifiedAfter: (at: Date | string) => term(`modifiedTime > ${time(at)}`),
  modifiedBefore: (at: Date | string) => term(`modifiedTime < ${time(at)}`),
  createdAfter: (at: Date | string) => term(`createdTime > ${time(at)}`),
  createdBefore: (at: Date | string) => term(`createdTime < ${time(at)}`),
  /** One of the app's own `appProperties` has this value: how the app finds the files it tagged. */
  appProperty: (key: string, value: string) => term(`appProperties has { key=${quoteDriveValue(key)} and value=${quoteDriveValue(value)} }`),
  and: (...parts: DriveQuery[]) => joined('and', parts),
  or: (...parts: DriveQuery[]) => joined('or', parts),
  not: (part: DriveQuery) => {
    if (!(part instanceof DriveQuery)) throw new ValidationError('driveQuery.not takes a driveQuery term');
    return term(`not (${part})`);
  },
} as const;
