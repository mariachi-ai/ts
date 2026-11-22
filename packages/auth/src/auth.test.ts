import { describe, expect, it } from 'vitest';
import { createContext } from '@mariachi/core';
import { DefaultAuth } from './auth';
import { JWTAdapter } from './adapters/jwt';
import type { AuthorizationAdapter } from './types';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child() { return silent; } };

function recordingTracer() {
  const spans: Array<{ name: string; attrs: Record<string, unknown> }> = [];
  const tracer = {
    async withSpan<T>(name: string, fn: (span: never) => Promise<T>): Promise<T> {
      const rec = { name, attrs: {} as Record<string, unknown> };
      spans.push(rec);
      const span = {
        setAttribute: (k: string, v: unknown) => {
          rec.attrs[k] = v;
        },
        setStatus() {},
        recordException() {},
        end() {},
      };
      return fn(span as never);
    },
  };
  return { spans, tracer };
}

describe('Auth spans', () => {
  it('never record the user id on auth.sign or auth.authenticate', async () => {
    const { spans, tracer } = recordingTracer();
    const authorization: AuthorizationAdapter = { can: async () => true, grant: async () => {}, revoke: async () => {}, getRoles: async () => [] };
    const auth = new DefaultAuth(
      { authentication: new JWTAdapter({ secret: 'auth-span-test-secret-at-least-32-chars' }), authorization },
      { logger: silent, tracer: tracer as never },
    );
    const ctx = createContext({ logger: silent });
    const token = await auth.sign(ctx, { userId: 'user-ada-7', tenantId: 'acme', scopes: [] }, '5m');
    const identity = await auth.authenticate(ctx, token);
    expect(identity.userId).toBe('user-ada-7');

    expect(spans.map((s) => s.name)).toEqual(['auth.sign', 'auth.authenticate']);
    for (const span of spans) {
      expect(Object.values(span.attrs)).not.toContain('user-ada-7');
      expect(span.attrs).not.toHaveProperty('userId');
    }
    expect(spans[1]?.attrs).toMatchObject({ identityType: identity.identityType });
  });
});
