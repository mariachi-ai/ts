import { z } from 'zod';

/** A user as Descope's API returns it (`ResponseUser`). */
export const DescopeUser = z
  .object({
    userId: z.string().min(1),
    loginIds: z.array(z.string()).nullish(),
    email: z.string().nullish(),
    verifiedEmail: z.boolean().nullish(),
    name: z.string().nullish(),
    givenName: z.string().nullish(),
    familyName: z.string().nullish(),
    picture: z.string().nullish(),
    status: z.string().nullish(),
  })
  .passthrough();
export type DescopeUser = z.infer<typeof DescopeUser>;

/** `{ user }`: load and create. */
export const UserResponse = z.object({ user: DescopeUser }).passthrough();

/** `{ users, total }`: search. */
export const UsersResponse = z.object({ users: z.array(DescopeUser).nullish(), total: z.number().nullish() }).passthrough();

/**
 * What a sign-in, a verified code and a refresh answer (`JWTResponse`). `refreshJwt` is in the body only when the
 * project returns refresh tokens in the response body rather than managing them in cookies.
 */
export const JwtResponse = z
  .object({
    sessionJwt: z.string().min(1),
    refreshJwt: z.string().nullish(),
    user: DescopeUser.nullish(),
    firstSeen: z.boolean().nullish(),
  })
  .passthrough();
export type JwtResponse = z.infer<typeof JwtResponse>;

/**
 * One audit event, as Descope's Audit Webhook connector posts them: `action` is the event's name exactly as the
 * Audit Events page lists it (`UserCreated`, `LoginSucceed`), `occurred` is Unix milliseconds.
 */
export const DescopeAuditEvent = z
  .object({
    action: z.string().min(1),
    occurred: z.number(),
    userId: z.string().nullish(),
    actorId: z.string().nullish(),
    projectId: z.string().nullish(),
    loginIds: z.array(z.string()).nullish(),
    tenants: z.unknown().optional(),
    method: z.string().nullish(),
    data: z.record(z.unknown()).nullish(),
  })
  .passthrough();
export type DescopeAuditEvent = z.infer<typeof DescopeAuditEvent>;
