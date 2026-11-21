import { z } from 'zod';

/**
 * Cognito's answers, as far as this package reads them. Unknown fields pass through, so a field Cognito adds doesn't
 * fail the boundary; one this package relies on that goes missing does.
 */

/** The user pool's public keys (`/.well-known/jwks.json`). */
export const Jwks = z.object({ keys: z.array(z.object({ kty: z.string() }).passthrough()) }).passthrough();

/** `AuthenticationResult`, from InitiateAuth. */
export const AuthenticationResult = z
  .object({
    AccessToken: z.string().min(1),
    IdToken: z.string().min(1).optional(),
    RefreshToken: z.string().min(1).optional(),
    ExpiresIn: z.number().optional(),
    TokenType: z.string().optional(),
  })
  .passthrough();
export type AuthenticationResult = z.infer<typeof AuthenticationResult>;

/** InitiateAuth's answer: tokens, or a challenge to answer with `Session`. */
export const InitiateAuthResponse = z
  .object({
    AuthenticationResult: AuthenticationResult.optional(),
    ChallengeName: z.string().optional(),
    ChallengeParameters: z.record(z.string()).optional(),
    Session: z.string().optional(),
  })
  .passthrough();

/** The `/oauth2/token` endpoint's answer. A refresh returns a refresh token only when rotation is on. */
export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    id_token: z.string().min(1).optional(),
    refresh_token: z.string().min(1).optional(),
    token_type: z.string().optional(),
    expires_in: z.number().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

const Attribute = z.object({ Name: z.string(), Value: z.string().optional() }).passthrough();

/** A user as the admin API returns it: `Attributes` from ListUsers and AdminCreateUser, `UserAttributes` from AdminGetUser. */
export const CognitoUser = z
  .object({
    Username: z.string(),
    Attributes: z.array(Attribute).optional(),
    UserAttributes: z.array(Attribute).optional(),
    Enabled: z.boolean().optional(),
    UserStatus: z.string().optional(),
  })
  .passthrough();
export type CognitoUser = z.infer<typeof CognitoUser>;

export const ListUsersResponse = z.object({ Users: z.array(CognitoUser).default([]), PaginationToken: z.string().optional() }).passthrough();
export const CreateUserResponse = z.object({ User: CognitoUser }).passthrough();
