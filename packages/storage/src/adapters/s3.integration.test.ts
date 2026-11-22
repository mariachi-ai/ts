import { Readable } from 'node:stream';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { CreateBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { startMinio, stopAll } from '../../../../test/setup';
import { S3StorageAdapter } from './s3';
import { createStorage, storageConfig } from '../index';

let storage: S3StorageAdapter;
let fromSettings: S3StorageAdapter;

beforeAll(async () => {
  const minio = await startMinio();
  const bucket = `storage-${crypto.randomUUID().slice(0, 8)}`;
  const credentials = { accessKeyId: minio.accessKeyId, secretAccessKey: minio.secretAccessKey };
  const admin = new S3Client({ region: 'us-east-1', endpoint: minio.endpoint, forcePathStyle: true, credentials });
  await admin.send(new CreateBucketCommand({ Bucket: bucket }));
  admin.destroy();
  storage = new S3StorageAdapter({ adapter: 's3', bucket, region: 'us-east-1', endpoint: minio.endpoint, forcePathStyle: true, credentials, basePath: 'app' });
  // Only what the environment gives: no forcePathStyle, keys as two settings.
  fromSettings = createStorage(
    storageConfig({ adapter: 's3', bucket, region: 'us-east-1', endpoint: minio.endpoint, accessKeyId: minio.accessKeyId, secretAccessKey: minio.secretAccessKey }),
  ) as S3StorageAdapter;
}, 300_000);

afterAll(async () => {
  await stopAll();
});

describe('S3StorageAdapter (MinIO)', () => {
  it('works from settings alone: endpoint and keys, path-style by default', async () => {
    await fromSettings.put('settings.txt', 'from settings', { contentType: 'text/plain' });
    expect((await fromSettings.get('settings.txt'))?.toString()).toBe('from settings');
    expect(await fromSettings.isHealthy()).toBe(true);
  });

  it('streams a multipart upload larger than one part', async () => {
    const chunk = Buffer.alloc(1024 * 1024, 7);
    const body = Readable.from((function* () { for (let i = 0; i < 12; i++) yield chunk; })());
    await storage.putStream('big.bin', body, { contentType: 'application/octet-stream' });
    const head = await storage.head('big.bin');
    expect(head?.size).toBe(12 * 1024 * 1024);
  });

  it('accepts an upload through a presigned URL and serves it through a signed URL', async () => {
    const uploadUrl = await storage.signedUploadUrl('presigned.txt', { contentType: 'text/plain', expiresIn: 60 });
    const put = await fetch(uploadUrl, { method: 'PUT', body: 'from the browser', headers: { 'content-type': 'text/plain' } });
    expect(put.status).toBe(200);
    const read = await fetch(await storage.signedUrl('presigned.txt', { expiresIn: 60 }));
    expect(await read.text()).toBe('from the browser');
    // A well-formed signature that doesn't match (a malformed one is a 400 on some S3 servers).
    const forged = uploadUrl.replace(/X-Amz-Signature=[^&]+/, `X-Amz-Signature=${'0'.repeat(64)}`);
    expect((await fetch(forged, { method: 'PUT', body: 'x' })).status).toBe(403);
  });
});
