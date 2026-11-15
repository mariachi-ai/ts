import { describe, expect, it } from 'vitest';
import { isMultipart, parseMultipart, safeFilename, UploadError } from './index';

const BOUNDARY = '----test-boundary';
const CONTENT_TYPE = `multipart/form-data; boundary=${BOUNDARY}`;

type Part = { name: string; value: string | Buffer; filename?: string; type?: string };

function multipartBody(parts: Part[], boundary = BOUNDARY): Buffer {
  const chunks: Buffer[] = [];
  for (const part of parts) {
    let head = `--${boundary}\r\nContent-Disposition: form-data; name="${part.name}"`;
    if (part.filename !== undefined) head += `; filename="${part.filename}"`;
    head += '\r\n';
    if (part.type) head += `Content-Type: ${part.type}\r\n`;
    chunks.push(Buffer.from(`${head}\r\n`), Buffer.isBuffer(part.value) ? part.value : Buffer.from(part.value), Buffer.from('\r\n'));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`));
  return Buffer.concat(chunks);
}

const failure = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(UploadError);
    return (err as UploadError).code;
  }
  return undefined;
};

describe('parseMultipart', () => {
  it('reads text fields and files, bytes intact', async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 255, 13, 10, 45, 45]);
    const parsed = await parseMultipart(
      CONTENT_TYPE,
      multipartBody([
        { name: 'title', value: 'Holiday' },
        { name: 'tag', value: 'a' },
        { name: 'tag', value: 'b' },
        { name: 'photo', value: png, filename: 'beach.png', type: 'image/png' },
        { name: 'notes', value: 'plain text', filename: 'notes.txt' },
      ]),
    );
    expect({ ...parsed.fields }).toEqual({ title: 'Holiday', tag: ['a', 'b'] });
    expect(parsed.files.map((f) => [f.field, f.filename, f.contentType, f.size])).toEqual([
      ['photo', 'beach.png', 'image/png', png.length],
      ['notes', 'notes.txt', 'text/plain', 10],
    ]);
    expect(parsed.files[0]?.bytes.equals(png)).toBe(true);
  });

  it('reduces a client\'s file name to a bare name', async () => {
    const parsed = await parseMultipart(CONTENT_TYPE, multipartBody([{ name: 'f', value: 'x', filename: '../../etc/passwd', type: 'text/plain' }]));
    expect(parsed.files[0]?.filename).toBe('passwd');
    expect(safeFilename('C:\\Users\\me\\report.pdf')).toBe('report.pdf');
    expect(safeFilename('a\u0000b\n.txt')).toBe('ab.txt');
    expect(safeFilename('..')).toBe('');
    expect(safeFilename(undefined)).toBe('');
    expect(safeFilename('x'.repeat(400))).toHaveLength(255);
  });

  it('refuses more files, larger files, more fields and larger fields than the limits', async () => {
    const file = (name: string, size = 10) => ({ name, value: Buffer.alloc(size, 1), filename: `${name}.bin`, type: 'application/octet-stream' });
    expect(await failure(parseMultipart(CONTENT_TYPE, multipartBody([file('a'), file('b')]), { maxFiles: 1 }))).toBe('http/too-many-files');
    expect(await failure(parseMultipart(CONTENT_TYPE, multipartBody([file('a', 2000)]), { maxFileBytes: 1000 }))).toBe('http/file-too-large');
    expect((await parseMultipart(CONTENT_TYPE, multipartBody([file('a', 1000)]), { maxFileBytes: 1000 })).files[0]?.size).toBe(1000);
    const fields = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `f${i}`, value: 'v' }));
    expect(await failure(parseMultipart(CONTENT_TYPE, multipartBody(fields(3)), { maxFields: 2 }))).toBe('http/too-many-fields');
    expect(await failure(parseMultipart(CONTENT_TYPE, multipartBody([{ name: 'big', value: 'x'.repeat(200) }]), { maxFieldBytes: 100 }))).toBe('http/field-too-large');
  });

  it('accepts only the declared types on the list', async () => {
    const body = (type: string) => multipartBody([{ name: 'f', value: 'x', filename: 'f', type }]);
    const limits = { allowedTypes: ['image/*', 'application/pdf'] };
    expect((await parseMultipart(CONTENT_TYPE, body('image/webp'), limits)).files).toHaveLength(1);
    expect((await parseMultipart(CONTENT_TYPE, body('Application/PDF'), limits)).files).toHaveLength(1);
    expect(await failure(parseMultipart(CONTENT_TYPE, body('text/html'), limits))).toBe('http/unsupported-file-type');
    expect(await failure(parseMultipart(CONTENT_TYPE, body('imagery/png'), limits))).toBe('http/unsupported-file-type');
  });

  it('refuses a body that isn\'t multipart, or is cut short', async () => {
    expect(await failure(parseMultipart('multipart/form-data', Buffer.from('x')))).toBe('http/invalid-multipart');
    const whole = multipartBody([{ name: 'f', value: Buffer.alloc(500, 1), filename: 'f.bin', type: 'application/octet-stream' }]);
    expect(await failure(parseMultipart(CONTENT_TYPE, whole.subarray(0, 200)))).toBe('http/invalid-multipart');
    // Cut at every length: always a clean refusal, never an exception outside the promise
    for (let cut = 0; cut < whole.length - 1; cut += 7) {
      expect(await failure(parseMultipart(CONTENT_TYPE, whole.subarray(0, cut))), `cut at ${cut}`).toBe('http/invalid-multipart');
    }
    expect(await failure(parseMultipart(CONTENT_TYPE, Buffer.from('not multipart at all')))).toBe('http/invalid-multipart');
  });

  it('keeps field names out of the object\'s prototype', async () => {
    const parsed = await parseMultipart(CONTENT_TYPE, multipartBody([{ name: '__proto__', value: 'x' }, { name: 'constructor', value: 'y' }]));
    expect(Object.keys(parsed.fields).sort()).toEqual(['__proto__', 'constructor']);
    expect(({} as Record<string, unknown>).x).toBeUndefined();
  });

  it('tells a multipart content type from the rest', () => {
    expect(isMultipart('multipart/form-data; boundary=x')).toBe(true);
    expect(isMultipart('Multipart/Form-Data ; boundary=x')).toBe(true);
    expect(isMultipart('multipart/form-data')).toBe(false);
    expect(isMultipart('application/json')).toBe(false);
    expect(isMultipart(undefined)).toBe(false);
  });
});
