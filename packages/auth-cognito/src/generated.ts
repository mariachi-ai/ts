// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Amazon Cognito: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'cognito',
  name: 'Amazon Cognito',
  category: 'auth',
  server: 'cognito-idp.{region}.amazonaws.com',
  docs: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools.html',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'region',
    env: 'COGNITO_REGION',
    label: 'Region',
    meaning: "The AWS Region the user pool is in, such as us-east-1. It names the host every call goes to and the tokens' issuer.",
    secret: false,
    required: true,
    whereToFind: 'The first part of the user pool ID (us-east-1 in us-east-1_EXAMPLE), or the Region selector in the Amazon Cognito console.',
    url: 'https://console.aws.amazon.com/cognito/home',
    public: true,
  },
  {
    key: 'userPoolId',
    env: 'COGNITO_USER_POOL_ID',
    label: 'User pool ID',
    meaning: "The user pool the app's users live in. Tokens are checked against its keys and issuer. Test and production use separate user pools.",
    secret: false,
    required: true,
    whereToFind: 'Amazon Cognito console › User pools › the pool › Overview, User pool ID. Use a separate user pool for test.',
    url: 'https://console.aws.amazon.com/cognito/home',
    public: true,
  },
  {
    key: 'clientId',
    env: 'COGNITO_CLIENT_ID',
    label: 'App client ID',
    meaning: 'The app client users sign in through. ID tokens carry it as aud and access tokens as client_id.',
    secret: false,
    required: true,
    whereToFind: 'The user pool › App clients › the app client, Client ID.',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html',
    public: true,
  },
  {
    key: 'clientSecret',
    env: 'COGNITO_CLIENT_SECRET',
    label: 'App client secret',
    meaning: 'Only for a confidential app client (one with a secret): sent on token requests and in the SECRET_HASH of password sign-in. Leave it unset for a public client.',
    secret: true,
    required: false,
    whereToFind: 'The user pool › App clients › the app client, Client secret (Show client secret).',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-client-apps.html',
  },
  {
    key: 'domain',
    env: 'COGNITO_DOMAIN',
    label: 'User pool domain',
    meaning: 'The managed login (hosted UI) domain, such as auth.example.com or example.auth.us-east-1.amazoncognito.com. Needed for social sign-in, code exchange, refresh and sign-out.',
    secret: false,
    required: false,
    whereToFind: 'The user pool › Branding › Domain: the Cognito domain, or your custom domain.',
    url: 'https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-assign-domain.html',
    public: true,
  },
  {
    key: 'awsAccessKeyId',
    env: 'COGNITO_AWS_ACCESS_KEY_ID',
    label: 'AWS access key ID',
    meaning: "Signs the admin calls that read, create and delete users. Optional: without it the AWS SDK's default credential chain (an IAM role, AWS_PROFILE, ...) is used.",
    secret: false,
    required: false,
    whereToFind: "IAM › Users › the app's user › Security credentials › Access keys, for a user allowed cognito-idp:AdminGetUser, ListUsers, AdminCreateUser, AdminDeleteUser and AdminSetUserPassword on the pool. Prefer an IAM role where the app runs on AWS.",
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  },
  {
    key: 'awsSecretAccessKey',
    env: 'COGNITO_AWS_SECRET_ACCESS_KEY',
    label: 'AWS secret access key',
    meaning: 'The secret half of the AWS access key, set together with the access key ID.',
    secret: true,
    required: false,
    whereToFind: 'Shown once, when the access key is created in IAM.',
    url: 'https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html',
  },
];

/** The config `createCognito` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  region: z.string().min(1),
  userPoolId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1).optional(),
  domain: z.string().min(1).optional(),
  awsAccessKeyId: z.string().min(1).optional(),
  awsSecretAccessKey: z.string().min(1).optional(),
});
export type CognitoConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  region: 'COGNITO_REGION',
  userPoolId: 'COGNITO_USER_POOL_ID',
  clientId: 'COGNITO_CLIENT_ID',
  clientSecret: 'COGNITO_CLIENT_SECRET',
  domain: 'COGNITO_DOMAIN',
  awsAccessKeyId: 'COGNITO_AWS_ACCESS_KEY_ID',
  awsSecretAccessKey: 'COGNITO_AWS_SECRET_ACCESS_KEY',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'jwks.get': {
    purpose: "Reads the user pool's public signing keys, from https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json.",
    method: 'GET',
    path: '/{userPoolId}/.well-known/jwks.json',
    idempotency: 'natural',
  },
  'auth.initiate': {
    purpose: 'Signs a user in with their username and password (InitiateAuth, AuthFlow USER_PASSWORD_AUTH), with SECRET_HASH for a confidential client. Unsigned JSON: X-Amz-Target AWSCognitoIdentityProviderService.InitiateAuth, Content-Type application/x-amz-json-1.1.',
    method: 'POST',
    path: '/',
    idempotency: 'none',
  },
  'tokens.exchange': {
    purpose: "Exchanges an authorization code and its PKCE verifier for ID, access and refresh tokens, at the user pool domain's /oauth2/token (grant_type authorization_code).",
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'tokens.refresh': {
    purpose: "Exchanges a refresh token for new ID and access tokens (and a new refresh token when rotation is on), at the user pool domain's /oauth2/token (grant_type refresh_token).",
    method: 'POST',
    path: '/oauth2/token',
    idempotency: 'none',
  },
  'tokens.revoke': {
    purpose: "Revokes a refresh token and the access tokens issued with it, at the user pool domain's /oauth2/revoke.",
    method: 'POST',
    path: '/oauth2/revoke',
    idempotency: 'natural',
  },
  'users.get': {
    purpose: 'Reads one user by username or sub (AdminGetUser, signed with AWS SigV4).',
    method: 'POST',
    path: '/',
    idempotency: 'natural',
  },
  'users.list': {
    purpose: 'Finds users by one attribute, exactly (ListUsers with a Filter such as email = "a@example.com", signed with AWS SigV4).',
    method: 'POST',
    path: '/',
    idempotency: 'natural',
  },
  'users.create': {
    purpose: "Creates a user without sending Cognito's invitation (AdminCreateUser with MessageAction SUPPRESS, signed with AWS SigV4).",
    method: 'POST',
    path: '/',
    idempotency: 'none',
  },
  'users.setPassword': {
    purpose: "Sets a user's permanent password (AdminSetUserPassword with Permanent true, signed with AWS SigV4).",
    method: 'POST',
    path: '/',
    idempotency: 'natural',
  },
  'users.delete': {
    purpose: 'Deletes a user (AdminDeleteUser, signed with AWS SigV4).',
    method: 'POST',
    path: '/',
    idempotency: 'natural',
  },
} as const;
export type CognitoOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  NotAuthorizedException: {
    category: 'invalid-request',
    reason: 'not-authorized',
  },
  UserNotFoundException: {
    category: 'not-found',
    reason: 'user-not-found',
  },
  UserNotConfirmedException: {
    category: 'invalid-request',
    reason: 'user-not-confirmed',
  },
  PasswordResetRequiredException: {
    category: 'invalid-request',
    reason: 'password-reset-required',
  },
  InvalidPasswordException: {
    category: 'invalid-request',
    reason: 'invalid-password',
  },
  InvalidParameterException: {
    category: 'invalid-request',
    reason: 'invalid-parameter',
  },
  UsernameExistsException: {
    category: 'conflict',
    reason: 'username-exists',
  },
  ResourceNotFoundException: {
    category: 'not-found',
    reason: 'resource-not-found',
  },
  TooManyRequestsException: {
    category: 'rate-limited',
    reason: 'too-many-requests',
  },
  InternalErrorException: {
    category: 'unavailable',
    reason: 'internal-error',
  },
  invalid_grant: {
    category: 'invalid-request',
    reason: 'invalid-grant',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'invalid-client',
  },
  unauthorized_client: {
    category: 'forbidden',
    reason: 'unauthorized-client',
  },
  invalid_request: {
    category: 'invalid-request',
    reason: 'invalid-oauth-request',
  },
};
