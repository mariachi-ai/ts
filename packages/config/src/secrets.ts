import { ConfigError } from '@mariachi/core';
import { hideContents } from './redact';
import type { SecretsAdapter } from './types';

export class Secrets implements SecretsAdapter {
  constructor(private readonly adapter: SecretsAdapter) {
    // It holds the adapter, which holds the values: a logged `ctx.secrets` must show none of them
    hideContents(this, '[Secrets]');
  }

  get(key: string, tenantId?: string): Promise<string | undefined> {
    return this.adapter.get(key, tenantId);
  }

  set(key: string, value: string, tenantId?: string): Promise<void> {
    return this.adapter.set(key, value, tenantId);
  }

  async getOrThrow(key: string, tenantId?: string): Promise<string> {
    const value = await this.adapter.get(key, tenantId);
    if (value === undefined || value === '') {
      throw new ConfigError('config/missing-secret', `Missing secret "${key}"${tenantId ? ` for tenant ${tenantId}` : ''}`, {
        key,
        tenantId,
      });
    }
    return value;
  }

  /** Tenant-scoped value, falling back to the global one. */
  async getForTenant(key: string, tenantId: string | null | undefined): Promise<string | undefined> {
    if (tenantId) {
      const scoped = await this.adapter.get(key, tenantId);
      if (scoped !== undefined) return scoped;
    }
    return this.adapter.get(key);
  }
}
