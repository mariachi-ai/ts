import type { S3Client } from '@aws-sdk/client-s3';
import { describe, expect, it } from 'vitest';
import { LocalStorageAdapter, S3StorageAdapter, createStorage, publicKey, storageConfig } from './index';

const s3 = { adapter: 's3', bucket: 'b', region: 'auto' } as const;

describe('storageConfig', () => {
  it('turns the settings into an S3-compatible config, path-style when an endpoint is set', () => {
    expect(
      storageConfig({ ...s3, endpoint: 'https://acc.r2.example', accessKeyId: 'id', secretAccessKey: 'secret' }),
    ).toEqual({
      ...s3,
      endpoint: 'https://acc.r2.example',
      forcePathStyle: true,
      credentials: { accessKeyId: 'id', secretAccessKey: 'secret' },
    });
    expect(storageConfig(s3)).toEqual(s3);
    expect(storageConfig()).toEqual({ adapter: 'local' });
  });

  it('wants both keys or neither, and a known adapter', () => {
    expect(() => storageConfig({ ...s3, accessKeyId: 'id' })).toThrow(/STORAGE_SECRET_ACCESS_KEY/);
    expect(() => storageConfig({ ...s3, secretAccessKey: 'secret' })).toThrow(/STORAGE_ACCESS_KEY_ID/);
    expect(() => storageConfig({ adapter: 'ftp' })).toThrow(expect.objectContaining({ code: 'storage/unknown-adapter' }));
  });
});

describe('S3 addressing', () => {
  const clientConfig = (adapter: unknown) =>
    (adapter as { client: S3Client }).client.config as unknown as { forcePathStyle?: boolean };

  it('is path-style when an endpoint is set, unless told otherwise', () => {
    expect(clientConfig(createStorage({ ...s3, endpoint: 'http://localhost:9000' })).forcePathStyle).toBe(true);
    expect(clientConfig(createStorage({ ...s3, endpoint: 'http://localhost:9000', forcePathStyle: false })).forcePathStyle).toBe(false);
    expect(clientConfig(createStorage(s3)).forcePathStyle).toBeFalsy();
  });
});

describe('publicPrefix', () => {
  it('gives public URLs only under the prefix', () => {
    const local = new LocalStorageAdapter({ basePath: './unused', publicBaseUrl: 'https://cdn.example/', publicPrefix: 'public' });
    expect(local.publicUrl('public/avatars/a b.png')).toBe('https://cdn.example/public/avatars/a%20b.png');
    expect(() => local.publicUrl('private/invoice.pdf')).toThrow(expect.objectContaining({ code: 'storage/not-public' }));
    expect(() => local.publicUrl('publicity.txt')).toThrow(expect.objectContaining({ code: 'storage/not-public' }));

    const bucket = new S3StorageAdapter({ ...s3, basePath: 'app', publicBaseUrl: 'https://cdn.example', publicPrefix: 'public/' });
    expect(bucket.publicUrl('public/a.png')).toBe('https://cdn.example/app/public/a.png');
    expect(() => bucket.publicUrl('a.png')).toThrow(expect.objectContaining({ code: 'storage/not-public' }));
  });

  it('needs a public base URL to be set', () => {
    expect(() => new S3StorageAdapter({ ...s3, publicPrefix: 'public' })).toThrow(/STORAGE_PUBLIC_BASE_URL/);
    expect(() => new LocalStorageAdapter({ publicPrefix: 'public' })).toThrow(/STORAGE_PUBLIC_BASE_URL/);
  });

  it('lets every key through when unset, as before', () => {
    expect(publicKey('private/x', undefined)).toBe('private/x');
    expect(new LocalStorageAdapter({ basePath: './unused' }).publicUrl('private/x')).toBe('/storage/private/x');
  });
});
