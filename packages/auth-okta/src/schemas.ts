import { z } from 'zod';

/**
 * Okta's shapes, as far as this package reads them. Unknown fields pass through (`passthrough`), so a field Okta
 * adds doesn't fail the boundary; a field the package relies on that goes missing does.
 */

/** What `/v1/token` answers, for every grant. `refresh_token` only with the `offline_access` scope, `id_token` only with `openid`. */
export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    token_type: z.string(),
    expires_in: z.number().optional(),
    refresh_token: z.string().optional(),
    id_token: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

/** A user's profile: the default attributes this package reads, and any custom ones. */
export const OktaUserProfile = z
  .object({
    login: z.string(),
    email: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    displayName: z.string().nullish(),
  })
  .passthrough();

/** A user, as the Users API returns it. */
export const OktaUser = z
  .object({
    /** Okta's id for the user (`00u…`): the access token's `uid` and the ID token's `sub`. */
    id: z.string(),
    /** `STAGED`, `PROVISIONED`, `ACTIVE`, `RECOVERY`, `PASSWORD_EXPIRED`, `LOCKED_OUT`, `SUSPENDED` or `DEPROVISIONED`. */
    status: z.string(),
    profile: OktaUserProfile,
  })
  .passthrough();
export type OktaUser = z.infer<typeof OktaUser>;

export const OktaUserList = z.array(OktaUser);

/** One object of a System Log event: its actor or one of its targets. */
export const LogEventObject = z
  .object({
    id: z.string(),
    type: z.string(),
    /** For a user, their login. */
    alternateId: z.string().nullish(),
    displayName: z.string().nullish(),
  })
  .passthrough();
export type LogEventObject = z.infer<typeof LogEventObject>;

/** One event in an Event Hook delivery: a System Log `LogEvent`. */
export const LogEvent = z
  .object({
    /** The event's id. The same event can arrive twice: dedupe on it. */
    uuid: z.string(),
    published: z.string(),
    /** `user.lifecycle.create`, `user.account.update_profile`, … */
    eventType: z.string(),
    displayMessage: z.string().nullish(),
    actor: LogEventObject.nullish(),
    target: z.array(LogEventObject).nullish(),
    outcome: z.object({ result: z.string().nullish(), reason: z.string().nullish() }).passthrough().nullish(),
  })
  .passthrough();
export type LogEvent = z.infer<typeof LogEvent>;

/** What Okta posts to an Event Hook: a CloudEvents envelope around one or more events. */
export const OktaEventHookDelivery = z
  .object({
    /** `com.okta.event_hook`. */
    eventType: z.string(),
    /** The delivery's id: a retried delivery has the same one. */
    eventId: z.string(),
    eventTime: z.string(),
    /** The event hook that sent it: `https://{yourOktaDomain}/api/v1/eventHooks/{id}`. */
    source: z.string().optional(),
    data: z.object({ events: z.array(LogEvent) }).passthrough(),
  })
  .passthrough();
export type OktaEventHookDelivery = z.infer<typeof OktaEventHookDelivery>;
