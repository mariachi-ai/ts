import { ConfigError } from '@mariachi/core';
import type { StorageAdapterName, StorageConfig, StorageClient } from './types';
import { S3StorageAdapter } from './adapters/s3';
import { LocalStorageAdapter } from './adapters/local';
import { MemoryStorageAdapter } from './adapters/memory';

export type {
  StorageAdapterName,
  StorageConfig,
  StorageClient,
  AccessControl,
  PutOptions,
  SignedUrlOptions,
  SignedUploadOptions,
  ObjectInfo,
  ListOptions,
  ListResult,
  UploadValidation,
} from './types';

export { S3StorageAdapter } from './adapters/s3';
export { LocalStorageAdapter } from './adapters/local';
export { MemoryStorageAdapter } from './adapters/memory';
export { normalizeKey, buildKey, publicKey } from './keys';
export { sniffContentType, contentMatchesType } from './sniff';
export { Storage, DefaultStorage, type StorageServiceConfig } from './storage';
export { handleSignedLocalRequest, type LocalStorageHttpRequest, type LocalStorageHttpResponse } from './local-http';
export type { CannedAcl } from './types';

export function createStorage(config: StorageConfig): StorageClient {
  switch (config.adapter) {
    case 's3':
      return new S3StorageAdapter(config);
    case 'local':
      return new LocalStorageAdapter(config);
    case 'memory':
      return new MemoryStorageAdapter();
    default:
      throw new ConfigError('storage/unknown-adapter', `Unknown storage adapter: ${String((config as { adapter: unknown }).adapter)}`);
  }
}

/**
 * The storage settings `@mariachi/config` reads (`config.storage`), turned into a `createStorage`
 * config: `createStorage(storageConfig(config.storage))`. The two key settings go together, and
 * an endpoint means path-style addressing.
 */
export interface StorageSettings {
  adapter?: string;
  bucket?: string;
  region?: string;
  basePath?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicBaseUrl?: string;
  publicPrefix?: string;
  signingSecret?: string;
}

const ADAPTERS: readonly StorageAdapterName[] = ['s3', 'local', 'memory'];

export function storageConfig(settings: StorageSettings = {}): StorageConfig {
  const adapter = settings.adapter ?? 'local';
  if (!ADAPTERS.includes(adapter as StorageAdapterName)) {
    throw new ConfigError('storage/unknown-adapter', `Unknown storage adapter: ${adapter}`);
  }
  if (Boolean(settings.accessKeyId) !== Boolean(settings.secretAccessKey)) {
    throw new ConfigError(
      'storage/invalid-config',
      'Set both STORAGE_ACCESS_KEY_ID and STORAGE_SECRET_ACCESS_KEY, or neither',
    );
  }
  const config: StorageConfig = { adapter: adapter as StorageAdapterName };
  if (settings.basePath) config.basePath = settings.basePath;
  if (settings.bucket) config.bucket = settings.bucket;
  if (settings.region) config.region = settings.region;
  if (settings.endpoint) {
    config.endpoint = settings.endpoint;
    config.forcePathStyle = true;
  }
  if (settings.accessKeyId && settings.secretAccessKey) {
    config.credentials = { accessKeyId: settings.accessKeyId, secretAccessKey: settings.secretAccessKey };
  }
  if (settings.publicBaseUrl) config.publicBaseUrl = settings.publicBaseUrl;
  if (settings.publicPrefix) config.publicPrefix = settings.publicPrefix;
  if (settings.signingSecret) config.signingSecret = settings.signingSecret;
  return config;
}
