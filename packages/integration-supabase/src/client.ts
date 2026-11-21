import { type Context, fromZodError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import { z } from 'zod';
import { SupabaseError } from './errors';
import { type SupabaseConfig, type SupabaseOperation, configSchema, errorMap, provider } from './generated';
import { keyHeaders, projectUrl } from './keys';
import {
  CreateUserInput,
  DeleteUserInput,
  GetUserInput,
  InviteUserInput,
  InvokeInput,
  ListUsersInput,
  SupabaseUser,
  UserPage,
} from './schemas';

export interface SupabaseDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

const PAGE = 50;

/**
 * The Supabase client for what no Mariachi port covers: Edge Functions, and Auth's admin API. Each operation
 * takes `ctx` first, checks its input and Supabase's answer, and makes one span (`supabase functions.invoke`).
 * Build it once at startup and share it. Server-side only: it holds the secret key.
 *
 * ```ts
 * const supabase = createSupabase(settingsFromEnv(settings, readEnv), { tracer, metrics });
 * const result = await supabase.functions.invoke(ctx, { name: 'resize-image', body: { path } });
 * ```
 *
 * The database, sign-in and files are Mariachi's own ports pointed at the project: see `supabaseDatabaseConfig`,
 * `supabaseAuthConfig` and `supabaseStorageConfig`.
 */
export function createSupabase(config: SupabaseConfig, deps: SupabaseDeps = {}) {
  const cfg = configSchema.parse(config);
  const base = projectUrl(cfg.url);
  const server = new URL(base).host;

  function call<T>(
    ctx: Context,
    operation: SupabaseOperation,
    request: Omit<ProviderRequest, 'url'> & { path: string },
    schema: z.ZodType<T, z.ZodTypeDef, unknown>,
    options: { authFailure?: boolean; attempts?: number } = {},
  ): Promise<T> {
    const { path, ...rest } = request;
    return providerRequest(
      ctx,
      { integration: provider.id, operation, category: provider.category, server },
      { ...rest, url: `${base}${path}`, headers: rest.headers ?? keyHeaders(cfg.secretKey) },
      {
        schema,
        error: SupabaseError,
        failure: options.authFailure ? authFailure : undefined,
        deps: options.attempts ? { ...deps, retry: { ...deps.retry, attempts: options.attempts } } : deps,
      },
    );
  }

  const functions = {
    /**
     * Calls an Edge Function with a JSON body and returns its answer, checked against `schema` (anything, by
     * default). As the app with the secret key, or, with `accessToken`, for that signed-in user: the function
     * then sees their token and Row Level Security applies to them.
     *
     * A function called with the secret key has to check it itself (`verify_jwt = false` and `withSupabase({ auth:
     * 'secret' })` in the function): Supabase's own check only understands JWTs. One attempt unless `safeToRetry`.
     */
    async invoke<T = unknown>(ctx: Context, input: InvokeInput, schema: z.ZodType<T, z.ZodTypeDef, unknown> = z.unknown() as z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
      const i = parse(InvokeInput, input);
      let headers: Record<string, string>;
      if (i.accessToken) {
        if (!cfg.publishableKey) {
          throw new SupabaseError('supabase/no-publishable-key', 'Set the publishable key (SUPABASE_PUBLISHABLE_KEY) to call a function for a signed-in user', { category: 'invalid-request' });
        }
        headers = { apikey: cfg.publishableKey, authorization: `Bearer ${i.accessToken}` };
      } else {
        headers = keyHeaders(cfg.secretKey);
      }
      return call(ctx, 'functions.invoke', { method: 'POST', path: `/functions/v1/${segment(i.name)}`, headers, json: i.body ?? {} }, schema, {
        attempts: i.safeToRetry ? undefined : 1,
      });
    },
  };

  const users = {
    /** One page of the project's users (`page` from 1, 50 a page by default). */
    async list(ctx: Context, input: z.input<typeof ListUsersInput> = {}) {
      const i = parse(ListUsersInput, input);
      return call(ctx, 'admin.users.list', { method: 'GET', path: '/auth/v1/admin/users', query: { page: i.page, per_page: i.perPage } }, UserPage, { authFailure: true });
    },
    /** Every user, fetching pages as they're read. Stop early with `break`. */
    async *all(ctx: Context, input: { perPage?: number } = {}): AsyncGenerator<SupabaseUser> {
      const perPage = input.perPage ?? PAGE;
      for (let page = 1; ; page += 1) {
        const { users: batch } = await users.list(ctx, { page, perPage });
        yield* batch;
        if (batch.length < perPage) return;
      }
    },
    /** One user, or `null` when there's none with this id. */
    async get(ctx: Context, userId: string): Promise<SupabaseUser | null> {
      const id = parse(GetUserInput, userId);
      try {
        return await call(ctx, 'admin.users.get', { method: 'GET', path: `/auth/v1/admin/users/${id}` }, SupabaseUser, { authFailure: true });
      } catch (error) {
        if (error instanceof SupabaseError && error.category === 'not-found') return null;
        throw error;
      }
    },
    /**
     * Makes a user. Sends no email: `emailConfirm` marks the address proven, so set it only when the app has
     * proven it. A taken address fails with `supabase/email-exists`.
     */
    async create(ctx: Context, input: CreateUserInput) {
      const i = parse(CreateUserInput, input);
      return call(
        ctx,
        'admin.users.create',
        {
          method: 'POST',
          path: '/auth/v1/admin/users',
          json: {
            email: i.email,
            phone: i.phone,
            password: i.password,
            email_confirm: i.emailConfirm,
            phone_confirm: i.phoneConfirm,
            user_metadata: i.userMetadata,
            app_metadata: i.appMetadata,
          },
        },
        SupabaseUser,
        { authFailure: true },
      );
    },
    /** Supabase Auth emails an invitation whose link signs the user in (and lands on `redirectTo`). */
    async invite(ctx: Context, input: InviteUserInput) {
      const i = parse(InviteUserInput, input);
      return call(
        ctx,
        'admin.users.invite',
        { method: 'POST', path: '/auth/v1/invite', query: { redirect_to: i.redirectTo }, json: { email: i.email, data: i.data } },
        SupabaseUser,
        { authFailure: true },
      );
    },
    /** Deletes the user (or, with `softDelete`, marks them deleted). A user already gone is not an error. */
    async delete(ctx: Context, input: DeleteUserInput): Promise<void> {
      const i = parse(DeleteUserInput, input);
      try {
        await call(ctx, 'admin.users.delete', { method: 'DELETE', path: `/auth/v1/admin/users/${i.userId}`, json: { should_soft_delete: i.softDelete ?? false } }, z.unknown(), { authFailure: true });
      } catch (error) {
        if (error instanceof SupabaseError && error.category === 'not-found') return;
        throw error;
      }
    },
  };

  return { functions, admin: { users } };
}

export type Supabase = ReturnType<typeof createSupabase>;

/** Auth's error body carries `error_code` (`email_exists`): the code is kept, the message (`msg`) isn't. */
function authFailure(_status: number, body: unknown): FailureInfo | undefined {
  const code = typeof body === 'object' && body !== null && typeof (body as { error_code?: unknown }).error_code === 'string' ? (body as { error_code: string }).error_code : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Supabase input');
  return parsed.data;
}

function segment(value: string): string {
  return encodeURIComponent(value);
}
