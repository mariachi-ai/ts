import { NotificationError } from '@mariachi/core';

export interface EmailAddress {
  email: string;
  name?: string;
}

/** `Ada <ada@example.com>`, `"Lovelace, Ada" <ada@example.com>` or a bare address. */
export function parseAddress(value: string): EmailAddress {
  const trimmed = value.trim();
  const match = /^(.*)<([^<>]+)>$/.exec(trimmed);
  const email = (match ? match[2] : trimmed).trim();
  if (!email || /[\s<>,]/.test(email) || !email.includes('@')) {
    throw new NotificationError('notifications/invalid-input', `Invalid email address: ${value}`);
  }
  const name = match?.[1].trim().replace(/^"(.*)"$/, '$1').trim();
  return name ? { email, name } : { email };
}

/** One address or several, as a list with empty entries dropped. */
export function addressList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value]).map((entry) => entry.trim()).filter(Boolean);
}

/** The message's recipients; throws when there are none. */
export function recipients(to: string | string[], provider: string): string[] {
  const list = addressList(to);
  if (list.length === 0) throw new NotificationError('notifications/missing-recipient', `${provider} message has no recipient`);
  return list;
}

export function toBase64(content: string | Uint8Array): string {
  return Buffer.from(content).toString('base64');
}
