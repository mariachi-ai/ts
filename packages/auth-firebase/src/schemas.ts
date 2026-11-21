import { z } from 'zod';

/**
 * Firebase's shapes, as far as this package reads them. Unknown fields pass through, so a field
 * Firebase adds doesn't fail the boundary; one this package relies on that goes missing does.
 */

/** The key file from Firebase console › Settings › Service accounts › Generate new private key. */
export const ServiceAccount = z
  .object({
    type: z.literal('service_account'),
    project_id: z.string().min(1),
    private_key_id: z.string().min(1),
    private_key: z.string().includes('PRIVATE KEY'),
    client_email: z.string().email(),
  })
  .passthrough();
export type ServiceAccount = z.infer<typeof ServiceAccount>;

/** The public keys ID tokens are signed with, as a JWK set. */
export const KeySet = z
  .object({
    keys: z.array(z.object({ kid: z.string().min(1), kty: z.literal('RSA'), n: z.string(), e: z.string(), alg: z.string().optional(), use: z.string().optional() }).passthrough()).min(1),
  })
  .passthrough();
export type KeySet = z.infer<typeof KeySet>;

/** `accounts:signInWithPassword`, `accounts:signInWithEmailLink` and `accounts:signUp`. */
export const SignInResponse = z
  .object({
    localId: z.string().min(1),
    email: z.string().optional(),
    idToken: z.string().optional(),
    refreshToken: z.string().optional(),
    /** Seconds, as a string. */
    expiresIn: z.string().optional(),
    displayName: z.string().optional(),
    profilePicture: z.string().optional(),
    /** Present instead of tokens when the user must finish with a second factor. */
    mfaPendingCredential: z.string().optional(),
    isNewUser: z.boolean().optional(),
  })
  .passthrough();
export type SignInResponse = z.infer<typeof SignInResponse>;

/** `securetoken.googleapis.com/v1/token`: snake_case, unlike the rest. */
export const RefreshResponse = z
  .object({
    id_token: z.string().min(1),
    refresh_token: z.string().min(1),
    /** Seconds, as a string. */
    expires_in: z.string(),
    user_id: z.string().optional(),
  })
  .passthrough();

/** `oauth2.googleapis.com/token` for a service-account assertion. */
export const AccessTokenResponse = z.object({ access_token: z.string().min(1), expires_in: z.number(), token_type: z.string().optional() }).passthrough();

/** A user, as `accounts:lookup` returns it. */
export const UserInfo = z
  .object({
    localId: z.string().min(1),
    email: z.string().optional(),
    emailVerified: z.boolean().optional(),
    displayName: z.string().optional(),
    photoUrl: z.string().optional(),
    disabled: z.boolean().optional(),
    /** Seconds since the epoch, as a string: ID tokens whose `auth_time` is earlier are revoked. */
    validSince: z.string().optional(),
  })
  .passthrough();
export type UserInfo = z.infer<typeof UserInfo>;

/** No match is an answer without `users`. */
export const LookupResponse = z.object({ users: z.array(UserInfo).default([]) }).passthrough();

/** `accounts:sendOobCode`: `email` when Firebase sent it, `oobCode` and `oobLink` when the app asked for them. */
export const OobCodeResponse = z.object({ email: z.string().optional(), oobCode: z.string().optional(), oobLink: z.string().optional() }).passthrough();

export const ResetPasswordResponse = z.object({ email: z.string().optional(), requestType: z.string().optional() }).passthrough();

export const Email = z.string().trim().email().max(255);
export const Password = z.string().min(1);
