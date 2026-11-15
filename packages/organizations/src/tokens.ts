import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Whether `value` has the shape of the ids organizations and invitations are given. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

/** 32 random bytes, as the text that goes in an invitation link. */
export function newInvitationSecret(): string {
  return randomBytes(32).toString('base64url');
}

/** What is stored in place of the secret. */
export function hashInvitationSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

/** The token an invitee is sent: the invitation's id, then its secret. */
export function invitationToken(invitationId: string, secret: string): string {
  return `${invitationId}.${secret}`;
}

/** The two halves of a token, or undefined when it isn't shaped like one. Says nothing about whether it is valid. */
export function parseInvitationToken(token: unknown): { invitationId: string; secret: string } | undefined {
  if (typeof token !== 'string' || token.length > 200) return undefined;
  const dot = token.indexOf('.');
  if (dot < 0) return undefined;
  const invitationId = token.slice(0, dot);
  const secret = token.slice(dot + 1);
  if (!isUuid(invitationId) || !/^[A-Za-z0-9_-]{20,100}$/.test(secret)) return undefined;
  return { invitationId, secret };
}

/** Compares the secret with the stored hash in constant time. */
export function secretMatches(secret: string, tokenHash: string): boolean {
  const given = Buffer.from(hashInvitationSecret(secret), 'hex');
  const stored = Buffer.from(tokenHash, 'hex');
  return given.length === stored.length && timingSafeEqual(given, stored);
}

/** An email address as it is stored and compared: trimmed, lowercased. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** A name as a slug: lowercase letters, digits and single hyphens, at most 48 characters. */
export function slugify(name: string): string {
  const slug = name
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/g, '');
  return slug.length >= 3 ? slug : `org-${slug || randomSuffix()}`.slice(0, 48);
}

/** Four characters, to tell one generated slug from another. */
export function randomSuffix(): string {
  return randomBytes(3).toString('hex').slice(0, 4);
}

/** A slug someone chose: 3 to 63 of lowercase letters, digits and hyphens, not starting or ending with a hyphen. */
export const SLUG = /^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/;
