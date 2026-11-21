// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** Firebase Authentication: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'firebase',
  name: 'Firebase Authentication',
  category: 'auth',
  server: 'identitytoolkit.googleapis.com',
  baseUrl: 'https://identitytoolkit.googleapis.com/v1',
  docs: 'https://firebase.google.com/docs/reference/rest/auth',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'apiKey',
    env: 'FIREBASE_API_KEY',
    label: 'Web API key',
    meaning: "Identifies the Firebase project to the Identity Toolkit API, for sign-in, token refresh and password resets. Not a secret: Firebase says it's OK to include in code.",
    secret: false,
    required: true,
    whereToFind: 'Firebase console › Settings › General › Your apps › your web app › Config: apiKey. Test and production are separate Firebase projects, each with its own key; the keys look alike, so nothing tells one from the other.',
    url: 'https://firebase.google.com/docs/projects/api-keys',
    public: true,
  },
  {
    key: 'authDomain',
    env: 'FIREBASE_AUTH_DOMAIN',
    label: 'Auth domain',
    meaning: "The domain the browser's Firebase SDK signs in through (Google and GitHub sign-in). The server doesn't call it; it's here so the app can hand the browser its config.",
    secret: false,
    required: false,
    whereToFind: 'Firebase console › Settings › General › Your apps › your web app › Config: authDomain, usually <projectId>.firebaseapp.com.',
    url: 'https://firebase.google.com/docs/web/setup',
    public: true,
  },
  {
    key: 'projectId',
    env: 'FIREBASE_PROJECT_ID',
    label: 'Project ID',
    meaning: "The Firebase project whose ID tokens the app accepts: every token's aud must be it, and its iss https://securetoken.google.com/<projectId>.",
    secret: false,
    required: true,
    whereToFind: 'Firebase console › Settings › General: Project ID. Use a separate Firebase project for test.',
    url: 'https://firebase.google.com/docs/projects/learn-more#project-id',
    public: true,
  },
  {
    key: 'serviceAccountJson',
    env: 'FIREBASE_SERVICE_ACCOUNT_JSON',
    label: 'Service account key',
    meaning: "The project's service account key file, as JSON. It signs the requests that manage users (look up, create, delete, set a password, revoke sessions) and the revocation check. Leave it unset if the app only verifies tokens and signs users in.",
    secret: true,
    required: false,
    whereToFind: 'Firebase console › Settings › Service accounts › Generate new private key. The whole downloaded file is the value. It must belong to the same project as the project ID.',
    url: 'https://firebase.google.com/docs/admin/setup#initialize-sdk-non-google',
  },
];

/** The config `createFirebase` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  apiKey: z.string().min(1),
  authDomain: z.string().min(1).optional(),
  projectId: z.string().min(1),
  serviceAccountJson: z.string().min(1).optional(),
});
export type FirebaseConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  serviceAccountJson: 'FIREBASE_SERVICE_ACCOUNT_JSON',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'keys.get': {
    purpose: 'Reads the public keys Firebase signs ID tokens with (RS256), at https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com, kept for the Cache-Control max-age of the answer.',
    method: 'GET',
    idempotency: 'natural',
  },
  'accounts.signInWithPassword': {
    purpose: 'Signs a user in with email and password, with the web API key: an ID token, a refresh token, or an MFA challenge.',
    method: 'POST',
    path: '/accounts:signInWithPassword',
    idempotency: 'none',
  },
  'accounts.signUp': {
    purpose: 'Creates an email and password user, with the web API key (self sign-up; the email is unverified).',
    method: 'POST',
    path: '/accounts:signUp',
    idempotency: 'none',
  },
  'accounts.sendOobCode': {
    purpose: 'Has Firebase email a password reset (PASSWORD_RESET) or a sign-in link (EMAIL_SIGNIN), with the web API key.',
    method: 'POST',
    path: '/accounts:sendOobCode',
    idempotency: 'none',
  },
  'accounts.resetPassword': {
    purpose: 'Sets a new password with the oobCode from a password reset email, with the web API key.',
    method: 'POST',
    path: '/accounts:resetPassword',
    idempotency: 'none',
  },
  'accounts.signInWithEmailLink': {
    purpose: 'Signs a user in with the email and the oobCode from a sign-in link, creating the user when none has the email, with the web API key.',
    method: 'POST',
    path: '/accounts:signInWithEmailLink',
    idempotency: 'none',
  },
  'token.refresh': {
    purpose: 'Exchanges a refresh token for a new ID token, at https://securetoken.googleapis.com/v1/token, with the web API key.',
    method: 'POST',
    idempotency: 'natural',
  },
  'serviceAccount.token': {
    purpose: "Exchanges a JWT signed with the service account's key (RS256, scope https://www.googleapis.com/auth/identitytoolkit) for a Google OAuth access token, at https://oauth2.googleapis.com/token. The token is reused until shortly before it expires.",
    method: 'POST',
    idempotency: 'natural',
  },
  'projects.accounts.lookup': {
    purpose: 'Reads users by id or by email, with the service account.',
    method: 'POST',
    path: '/projects/{projectId}/accounts:lookup',
    idempotency: 'natural',
  },
  'projects.accounts.signUp': {
    purpose: 'Creates a user, with the service account: the email can be marked verified.',
    method: 'POST',
    path: '/projects/{projectId}/accounts',
    idempotency: 'none',
  },
  'projects.accounts.update': {
    purpose: "Sets a user's password, or revokes every refresh token issued to them before now (validSince), with the service account.",
    method: 'POST',
    path: '/projects/{projectId}/accounts:update',
    idempotency: 'natural',
  },
  'projects.accounts.delete': {
    purpose: 'Deletes a user, with the service account.',
    method: 'POST',
    path: '/projects/{projectId}/accounts:delete',
    idempotency: 'natural',
  },
  'projects.accounts.sendOobCode': {
    purpose: 'Makes a password reset or sign-in link without emailing it (returnOobLink), so the app sends it, with the service account.',
    method: 'POST',
    path: '/projects/{projectId}/accounts:sendOobCode',
    idempotency: 'none',
  },
} as const;
export type FirebaseOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {
  EMAIL_NOT_FOUND: {
    category: 'not-found',
    reason: 'email-not-found',
  },
  INVALID_PASSWORD: {
    category: 'invalid-request',
    reason: 'invalid-password',
  },
  INVALID_LOGIN_CREDENTIALS: {
    category: 'invalid-request',
    reason: 'invalid-login-credentials',
  },
  USER_DISABLED: {
    category: 'forbidden',
    reason: 'user-disabled',
  },
  USER_NOT_FOUND: {
    category: 'not-found',
    reason: 'user-not-found',
  },
  TOO_MANY_ATTEMPTS_TRY_LATER: {
    category: 'rate-limited',
    reason: 'too-many-attempts',
  },
  EMAIL_EXISTS: {
    category: 'conflict',
    reason: 'email-exists',
  },
  OPERATION_NOT_ALLOWED: {
    category: 'forbidden',
    reason: 'operation-not-allowed',
  },
  INVALID_OOB_CODE: {
    category: 'invalid-request',
    reason: 'invalid-oob-code',
  },
  EXPIRED_OOB_CODE: {
    category: 'invalid-request',
    reason: 'expired-oob-code',
  },
  TOKEN_EXPIRED: {
    category: 'invalid-request',
    reason: 'token-expired',
  },
  INVALID_REFRESH_TOKEN: {
    category: 'invalid-request',
    reason: 'invalid-refresh-token',
  },
  INVALID_ID_TOKEN: {
    category: 'invalid-request',
    reason: 'invalid-id-token',
  },
  invalid_grant: {
    category: 'unauthorized',
    reason: 'service-account-refused',
  },
  invalid_client: {
    category: 'unauthorized',
    reason: 'service-account-invalid',
  },
  disabled_client: {
    category: 'unauthorized',
    reason: 'service-account-disabled',
  },
};
