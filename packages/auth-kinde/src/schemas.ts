import { z } from 'zod';

/** What `/oauth2/token` answers. `refresh_token` only when the sign-in asked for the `offline` scope. */
export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    id_token: z.string().optional(),
    refresh_token: z.string().optional(),
    expires_in: z.number().optional(),
    token_type: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

/** A user, as `GET /api/v1/user` reads it. */
export const KindeUser = z
  .object({
    id: z.string().min(1),
    provided_id: z.string().nullish(),
    preferred_email: z.string().nullish(),
    first_name: z.string().nullish(),
    last_name: z.string().nullish(),
    picture: z.string().nullish(),
    is_suspended: z.boolean().nullish(),
  })
  .passthrough();
export type KindeUser = z.infer<typeof KindeUser>;

/** `GET /api/v1/users`: the list's rows name the address `email`, not `preferred_email`. */
export const KindeUserList = z
  .object({
    users: z
      .array(
        z
          .object({
            id: z.string().min(1),
            provided_id: z.string().nullish(),
            email: z.string().nullish(),
            first_name: z.string().nullish(),
            last_name: z.string().nullish(),
            picture: z.string().nullish(),
          })
          .passthrough(),
      )
      .nullish(),
    next_token: z.string().nullish(),
  })
  .passthrough();

/** `GET /api/v1/users/{id}/identities`: each with whether it is confirmed. */
export const KindeIdentities = z
  .object({
    identities: z
      .array(
        z
          .object({
            type: z.string().nullish(),
            email: z.string().nullish(),
            name: z.string().nullish(),
            is_confirmed: z.boolean().nullish(),
          })
          .passthrough(),
      )
      .nullish(),
    has_more: z.boolean().nullish(),
  })
  .passthrough();
export type KindeIdentities = z.infer<typeof KindeIdentities>;

export const CreatedUser = z.object({ id: z.string().min(1), created: z.boolean().optional() }).passthrough();

/** A Kinde webhook's payload, once its JWT is verified. `data` is the event's own shape (`data.user` for user events). */
export const KindeWebhookPayload = z
  .object({
    type: z.string().min(1),
    event_id: z.string().min(1),
    timestamp: z.string().min(1),
    event_timestamp: z.string().optional(),
    source: z.string().optional(),
    data: z.record(z.unknown()).default({}),
  })
  .passthrough();
export type KindeWebhookPayload = z.infer<typeof KindeWebhookPayload>;
