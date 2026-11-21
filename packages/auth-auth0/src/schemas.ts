import { z } from 'zod';

/** What `/oauth/token` answers with. `refresh_token` only with `offline_access`, `id_token` only with `openid`. */
export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    token_type: z.string().optional(),
    expires_in: z.number().optional(),
    refresh_token: z.string().min(1).optional(),
    id_token: z.string().min(1).optional(),
    scope: z.string().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

/** A Management API token (client_credentials): about 24 hours (`expires_in: 86400`). */
export const ManagementToken = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).passthrough();

/** One of a user's identities: the connection they sign in through. */
export const Auth0Identity = z.object({ connection: z.string(), provider: z.string().optional(), user_id: z.union([z.string(), z.number()]).optional(), isSocial: z.boolean().optional() }).passthrough();

/** A user as the Management API and the event streams describe them. Only `user_id` is always there. */
export const Auth0User = z
  .object({
    user_id: z.string().min(1),
    email: z.string().optional(),
    email_verified: z.boolean().optional(),
    name: z.string().optional(),
    nickname: z.string().optional(),
    picture: z.string().optional(),
    identities: z.array(Auth0Identity).optional(),
    app_metadata: z.record(z.unknown()).optional(),
    user_metadata: z.record(z.unknown()).optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type Auth0User = z.infer<typeof Auth0User>;

export const Auth0UserList = z.array(Auth0User);

/**
 * A delivery from a webhook event stream: a CloudEvent. Auth0's own test delivery has `type: "user.created"`; its
 * event-types page writes `com.auth0.user.created`, so both are read (`auth0EventType` drops the prefix).
 * `a0tenant` and `a0stream` name the tenant and the stream; `a0purpose: "test"` marks a test delivery.
 */
export const Auth0Event = z
  .object({
    id: z.string().min(1),
    type: z.string().min(1),
    time: z.string().optional(),
    source: z.string().optional(),
    specversion: z.string().optional(),
    data: z.object({ object: z.record(z.unknown()).optional() }).passthrough(),
    a0tenant: z.string().optional(),
    a0stream: z.string().optional(),
    a0purpose: z.string().optional(),
  })
  .passthrough();
export type Auth0Event = z.infer<typeof Auth0Event>;
