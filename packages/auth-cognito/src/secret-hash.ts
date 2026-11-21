import { createHmac } from 'node:crypto';

/**
 * The `SECRET_HASH` an app client with a secret must send with InitiateAuth and the other user-facing calls:
 * `Base64(HMAC_SHA256(clientSecret, username + clientId))`. `username` is the sign-in name the user typed (their
 * email in a pool that signs in by email).
 */
export function cognitoSecretHash(username: string, clientId: string, clientSecret: string): string {
  return createHmac('sha256', clientSecret).update(`${username}${clientId}`).digest('base64');
}
