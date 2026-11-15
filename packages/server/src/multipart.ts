import { Busboy, type BusboyFileStream } from '@fastify/busboy';
import { MariachiError } from '@mariachi/core';

export interface UploadedFile {
  /** The form field the file came in */
  field: string;
  /** The name the client gave, reduced to a bare file name. Still the client's word: never a path to write to. */
  filename: string;
  /** The type the client declared. Check the bytes for anything that matters. */
  contentType: string;
  bytes: Buffer;
  size: number;
}

export interface MultipartLimits {
  /** Default 10. */
  maxFiles?: number;
  /** Per file. Default: no limit beyond the route's body limit. */
  maxFileBytes?: number;
  /** Text fields. Default 100. */
  maxFields?: number;
  /** Per text field. Default 64 KiB. */
  maxFieldBytes?: number;
  /** Declared content types to accept, e.g. `['image/png', 'image/*']`. Default: any. */
  allowedTypes?: string[];
}

export interface ParsedMultipart {
  fields: Record<string, string | string[]>;
  files: UploadedFile[];
}

/** Thrown for a bad upload. Codes: `http/invalid-multipart`, `http/too-many-files`, `http/file-too-large`, `http/too-many-fields`, `http/field-too-large`, `http/unsupported-file-type`. */
export class UploadError extends MariachiError {
  constructor(code: string, message: string, metadata?: Record<string, unknown>) {
    super(code, message, metadata);
    this.name = 'UploadError';
  }
}

/** A client's file name as a bare name: no directories, no control characters, at most 255 characters. */
export function safeFilename(name: string | undefined): string {
  const base = (name ?? '').split(/[\\/]/).pop() ?? '';
  // biome-ignore lint/suspicious/noControlCharactersInRegex: control characters are what's being removed
  const clean = base.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return clean === '.' || clean === '..' ? '' : clean.slice(0, 255);
}

const typeAllowed = (type: string, allowed: string[]): boolean => {
  const t = type.toLowerCase().split(';')[0]!.trim();
  return allowed.some((a) => {
    const want = a.toLowerCase();
    return want === t || (want.endsWith('/*') && t.startsWith(want.slice(0, -1)));
  });
};

export const isMultipart = (contentType: string | undefined): boolean => /^multipart\/form-data\s*;/i.test(contentType ?? '');

/**
 * Parses a buffered `multipart/form-data` body: text fields (a name sent twice becomes an array) and
 * files held in memory. The body is already bounded by the route's body limit; the limits here bound
 * each part. Throws `UploadError`.
 */
export function parseMultipart(contentType: string, body: Buffer, limits: MultipartLimits = {}): Promise<ParsedMultipart> {
  const maxFiles = limits.maxFiles ?? 10;
  const maxFields = limits.maxFields ?? 100;
  const maxFieldBytes = limits.maxFieldBytes ?? 64 * 1024;
  return new Promise((resolve, reject) => {
    let busboy: InstanceType<typeof Busboy>;
    try {
      busboy = new Busboy({
        headers: { 'content-type': contentType },
        limits: { files: maxFiles, fileSize: limits.maxFileBytes, fields: maxFields, fieldSize: maxFieldBytes, fieldNameSize: 200, parts: maxFiles + maxFields },
      });
    } catch {
      reject(new UploadError('http/invalid-multipart', 'The body is not valid multipart/form-data'));
      return;
    }
    const fields: Record<string, string | string[]> = Object.create(null);
    const files: UploadedFile[] = [];
    let failure: UploadError | undefined;
    const fail = (error: UploadError) => {
      failure ??= error;
    };

    busboy.on('field', (name: string, value: string, nameTruncated: boolean, valueTruncated: boolean) => {
      if (nameTruncated || valueTruncated) return fail(new UploadError('http/field-too-large', `Field "${name.slice(0, 80)}" is too large`, { field: name.slice(0, 80) }));
      const existing = fields[name];
      fields[name] = existing === undefined ? value : Array.isArray(existing) ? [...existing, value] : [existing, value];
    });
    busboy.on('file', (field: string, stream: BusboyFileStream, filename: string, _encoding: string, mimeType: string) => {
      const chunks: Buffer[] = [];
      const type = mimeType || 'application/octet-stream';
      if (limits.allowedTypes && !typeAllowed(type, limits.allowedTypes)) {
        fail(new UploadError('http/unsupported-file-type', `Files of type ${type.slice(0, 80)} aren't accepted here`, { field, allowed: limits.allowedTypes }));
      }
      stream.on('data', (chunk: Buffer) => {
        if (!failure) chunks.push(chunk);
      });
      stream.on('limit', () => fail(new UploadError('http/file-too-large', `File in "${field}" is larger than ${limits.maxFileBytes} bytes`, { field, maxFileBytes: limits.maxFileBytes })));
      // A part cut short errors on its own stream; with no listener that would be an uncaught exception
      stream.on('error', () => fail(new UploadError('http/invalid-multipart', 'The body is not valid multipart/form-data')));
      stream.on('end', () => {
        if (failure) return;
        const bytes = Buffer.concat(chunks);
        files.push({ field, filename: safeFilename(filename), contentType: type, bytes, size: bytes.length });
      });
    });
    busboy.on('filesLimit', () => fail(new UploadError('http/too-many-files', `At most ${maxFiles} file(s) per request`, { maxFiles })));
    busboy.on('fieldsLimit', () => fail(new UploadError('http/too-many-fields', `At most ${maxFields} field(s) per request`, { maxFields })));
    busboy.on('partsLimit', () => fail(new UploadError('http/too-many-fields', 'Too many parts in the request')));
    busboy.on('error', () => reject(failure ?? new UploadError('http/invalid-multipart', 'The body is not valid multipart/form-data')));
    busboy.on('finish', () => (failure ? reject(failure) : resolve({ fields, files })));
    try {
      busboy.end(body);
    } catch {
      reject(new UploadError('http/invalid-multipart', 'The body is not valid multipart/form-data'));
    }
  });
}
