import { z } from 'zod';

/**
 * Stytch's objects as its Consumer API returns them: only the fields this package reads, with the rest kept
 * (`.passthrough()`) so an app can read more without a new release. Tokens a provider hands back about the
 * person's own Google or GitHub account (`provider_values`) are never kept.
 */

export const StytchEmail = z.object({ email_id: z.string(), email: z.string(), verified: z.boolean() }).passthrough();

export const StytchUser = z
  .object({
    user_id: z.string(),
    emails: z.array(StytchEmail),
    status: z.string(),
    name: z.object({ first_name: z.string().optional(), middle_name: z.string().optional(), last_name: z.string().optional() }).passthrough().nullish(),
    providers: z.array(z.object({ provider_type: z.string(), profile_picture_url: z.string().optional() }).passthrough()).default([]),
    external_id: z.string().nullish(),
    roles: z.array(z.string()).default([]),
    trusted_metadata: z.record(z.unknown()).nullish(),
    untrusted_metadata: z.record(z.unknown()).nullish(),
    created_at: z.string().optional(),
  })
  .passthrough();
export type StytchUser = z.infer<typeof StytchUser>;

export const StytchSession = z
  .object({
    session_id: z.string(),
    user_id: z.string(),
    roles: z.array(z.string()).default([]),
    started_at: z.string().optional(),
    last_accessed_at: z.string().optional(),
    expires_at: z.string().optional(),
    custom_claims: z.record(z.unknown()).nullish(),
  })
  .passthrough();
export type StytchSession = z.infer<typeof StytchSession>;

/** What every call that signs someone in answers: the user, and the session it started. */
export const StytchAuthenticated = z.object({
  user_id: z.string(),
  user: StytchUser,
  session_token: z.string(),
  session_jwt: z.string(),
  session: StytchSession.optional(),
  /** `oauth.authenticate` names it `user_session`. */
  user_session: StytchSession.optional(),
});
export type StytchAuthenticated = z.infer<typeof StytchAuthenticated>;

/** `sessions.authenticate`. */
export const StytchSessionAuthenticated = z.object({
  session: StytchSession,
  session_token: z.string(),
  session_jwt: z.string(),
  user: StytchUser,
});

/** `GET /v1/users/{id}`: the user's fields at the top level. */
export const StytchUserResponse = StytchUser;

export const StytchUserCreated = z.object({ user_id: z.string(), email_id: z.string().optional(), user: StytchUser });

export const StytchUserSearch = z.object({
  results: z.array(StytchUser),
  results_metadata: z.object({ total: z.number().optional(), next_cursor: z.string().nullish() }).passthrough(),
});

export const StytchOtpSent = z.object({ user_id: z.string(), email_id: z.string(), user_created: z.boolean() });

export const StytchResetStarted = z.object({ user_id: z.string(), email_id: z.string().optional() });

export const StytchOk = z.object({ status_code: z.number().optional() }).passthrough();

export const StytchJwks = z.object({ keys: z.array(z.object({ kid: z.string(), kty: z.string() }).passthrough()).min(1) });

/** Stytch's error body. `error_message` is never kept: it can echo the input. */
export const StytchErrorBody = z.object({ status_code: z.number().optional(), error_type: z.string().optional() }).passthrough();

/**
 * A Stytch webhook as it arrives (after the Svix signature is checked). Create and update events carry the
 * whole entity under its `object_type` (`user` in a Consumer project); delete events carry only its `id`.
 */
export const StytchWebhookBody = z
  .object({
    project_id: z.string(),
    event_id: z.string(),
    action: z.string(),
    object_type: z.string(),
    source: z.string(),
    id: z.string(),
    timestamp: z.string().optional(),
    /** The user as it is after the change: Stytch's User object (`StytchUser.parse` and `stytchIdentityUser` read it). */
    user: z.object({ user_id: z.string().optional() }).passthrough().optional(),
  })
  .passthrough();
export type StytchWebhookBody = z.infer<typeof StytchWebhookBody>;
