import { createHash } from 'node:crypto';

/**
 * Mailchimp's id for a contact in an audience: the MD5 of the lowercased email address. Every member path takes
 * it (`/lists/{listId}/members/{subscriberHash}`), and it's the `id` on a member and in a webhook's `data`. Hash
 * the address this way, never the address as typed: `Ada@Example.com` and `ada@example.com` are one contact.
 */
export function subscriberHash(email: string): string {
  return createHash('md5').update(email.trim().toLowerCase()).digest('hex');
}

/**
 * The server prefix (data center) in an API key: the part after its last dash, `us6` in `…-us6`. Undefined when
 * the key has none.
 */
export function serverPrefixOf(apiKey: string): string | undefined {
  const dash = apiKey.lastIndexOf('-');
  const prefix = dash === -1 ? '' : apiKey.slice(dash + 1);
  return /^[a-z]+[0-9]+$/.test(prefix) ? prefix : undefined;
}
