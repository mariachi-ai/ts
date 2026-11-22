/**
 * `@mariachi/integration-supabase/testing`: a Supabase for an app's tests, held in memory, with the same shape as
 * `createSupabase`'s client; and a signed Auth Hook to post to the app's endpoint.
 */
import { randomUUID } from 'node:crypto';
import type { Context } from '@mariachi/core';
import { parseStandardWebhookSecrets, signStandardWebhook } from '@mariachi/webhooks';
import type { z } from 'zod';
import type { Supabase } from './client';
import { SupabaseError } from './errors';
import type { SupabaseUser } from './schemas';

/** An Edge Function stand-in: given the body and the caller's token (none for the secret key), its answer. */
export type FakeFunction = (body: unknown, caller: { accessToken?: string }) => unknown | Promise<unknown>;

export interface FakeSupabase extends Supabase {
  users_: Map<string, SupabaseUser>;
  /** Every invocation, in order. */
  invocations_: Array<{ name: string; body: unknown; accessToken?: string }>;
  /** The invitations sent, in order. */
  invitations_: Array<{ email: string; redirectTo?: string }>;
}

/** An in-memory Supabase: give it functions and users, then hand it to the code under test in place of the client. */
export function fakeSupabase(seed: { functions?: Record<string, FakeFunction>; users?: SupabaseUser[] } = {}): FakeSupabase {
  const users_ = new Map((seed.users ?? []).map((u) => [u.id, u]));
  const invocations_: FakeSupabase['invocations_'] = [];
  const invitations_: FakeSupabase['invitations_'] = [];
  const taken = (email?: string) => email !== undefined && [...users_.values()].some((u) => u.email === email);
  const exists = () => new SupabaseError('supabase/email-exists', 'A user with this email address already exists', { category: 'conflict', providerCode: 'email_exists', status: 422 });

  const fake: FakeSupabase = {
    users_,
    invocations_,
    invitations_,
    functions: {
      async invoke<T = unknown>(_ctx: Context, input: Parameters<Supabase['functions']['invoke']>[1], schema?: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
        const fn = seed.functions?.[input.name];
        invocations_.push({ name: input.name, body: input.body, accessToken: input.accessToken });
        if (!fn) throw new SupabaseError('supabase/not-found', `No function ${input.name}`, { category: 'not-found', status: 404 });
        const answer = await fn(input.body, { accessToken: input.accessToken });
        return (schema ? schema.parse(answer) : answer) as T;
      },
    },
    admin: {
      users: {
        async list(_ctx, input = {}) {
          const perPage = input.perPage ?? 50;
          const start = ((input.page ?? 1) - 1) * perPage;
          return { users: [...users_.values()].slice(start, start + perPage) };
        },
        async *all() {
          yield* [...users_.values()];
        },
        async get(_ctx, userId) {
          return users_.get(userId) ?? null;
        },
        async create(_ctx, input) {
          if (taken(input.email)) throw exists();
          const now = new Date().toISOString();
          const user = supabaseUser({
            email: input.email,
            phone: input.phone,
            email_confirmed_at: input.emailConfirm ? now : null,
            user_metadata: input.userMetadata ?? {},
            app_metadata: input.appMetadata ?? {},
          });
          users_.set(user.id, user);
          return user;
        },
        async invite(_ctx, input) {
          if (taken(input.email)) throw exists();
          const user = supabaseUser({ email: input.email, user_metadata: input.data ?? {} });
          users_.set(user.id, user);
          invitations_.push({ email: input.email, redirectTo: input.redirectTo });
          return user;
        },
        async delete(_ctx, input) {
          users_.delete(input.userId);
        },
      },
    },
  };
  return fake;
}

/** A user to seed the fake with. */
export function supabaseUser(overrides: Partial<SupabaseUser> = {}): SupabaseUser {
  const now = new Date().toISOString();
  return { id: randomUUID(), role: 'authenticated', email_confirmed_at: null, app_metadata: {}, user_metadata: {}, created_at: now, updated_at: now, ...overrides };
}

/**
 * The body and Standard Webhooks headers Supabase Auth would send for this hook, signed with its secret
 * (`v1,whsec_…`): post it to the app's hook endpoint.
 */
export function signedSupabaseAuthHook(
  body: unknown,
  secret: string,
  options: { id?: string; timestampSeconds?: number } = {},
): { rawBody: string; headers: Record<string, string> } {
  const rawBody = JSON.stringify(body);
  const id = options.id ?? `msg_${randomUUID()}`;
  const timestamp = options.timestampSeconds ?? Math.floor(Date.now() / 1000);
  const [key] = parseStandardWebhookSecrets(secret);
  return { rawBody, headers: { 'webhook-id': id, 'webhook-timestamp': String(timestamp), 'webhook-signature': signStandardWebhook(key!, id, timestamp, rawBody) } };
}
