import { describe, expect, it } from 'vitest';
import { organizationsContract } from './contract';
import { MemoryOrganizationStore } from './memory';
import { roleAtLeast } from './organizations';
import { hashInvitationSecret, invitationToken, isUuid, newInvitationSecret, normalizeEmail, parseInvitationToken, secretMatches, slugify } from './tokens';

organizationsContract('memory', () => new MemoryOrganizationStore());

describe('roles', () => {
  it('orders owner above admin above member', () => {
    expect(roleAtLeast('owner', 'admin')).toBe(true);
    expect(roleAtLeast('admin', 'admin')).toBe(true);
    expect(roleAtLeast('member', 'admin')).toBe(false);
    expect(roleAtLeast('admin', 'owner')).toBe(false);
    expect(roleAtLeast('member', 'member')).toBe(true);
  });
});

describe('invitation tokens', () => {
  it('are an id and 32 random bytes, matched against a hash', () => {
    const id = crypto.randomUUID();
    const secret = newInvitationSecret();
    expect(Buffer.from(secret, 'base64url')).toHaveLength(32);
    expect(newInvitationSecret()).not.toBe(secret);
    expect(parseInvitationToken(invitationToken(id, secret))).toEqual({ invitationId: id, secret });
    const hash = hashInvitationSecret(secret);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(secretMatches(secret, hash)).toBe(true);
    expect(secretMatches(`${secret}x`, hash)).toBe(false);
    expect(secretMatches('', hash)).toBe(false);
    // A stored value that isn't a hash matches nothing, and doesn't throw
    expect(secretMatches(secret, 'not hex')).toBe(false);
    expect(secretMatches(secret, '')).toBe(false);
  });

  it('are refused unless shaped like one', () => {
    const id = crypto.randomUUID();
    for (const bad of [undefined, null, 42, '', 'no-dot', `${id}.short`, `not-a-uuid.${'a'.repeat(43)}`, `${id}.${'a'.repeat(43)}.more`, `${id}.${'!'.repeat(43)}`, `${id}.${'a'.repeat(400)}`]) {
      expect(parseInvitationToken(bad), String(bad).slice(0, 40)).toBeUndefined();
    }
  });
});

describe('ids, addresses and slugs', () => {
  it('tells an id from anything else', () => {
    expect(isUuid(crypto.randomUUID())).toBe(true);
    for (const bad of ['', 'user.main.alice', "1'; --", 'g'.repeat(36), undefined, 7]) expect(isUuid(bad)).toBe(false);
  });

  it('compares addresses without case or stray spaces', () => {
    expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
  });

  it('makes a slug from any name', () => {
    expect(slugify('Acme Rockets, Inc.')).toBe('acme-rockets-inc');
    expect(slugify('  Crème Brûlée & Co  ')).toBe('creme-brulee-co');
    expect(slugify('a'.repeat(80))).toBe('a'.repeat(48));
    expect(slugify(`${'word '.repeat(12)}`)).toMatch(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/);
    // Too little to go on still gives a usable slug
    expect(slugify('日本')).toMatch(/^org-[0-9a-f]{4}$/);
    expect(slugify('ab')).toBe('org-ab');
    expect(slugify('!!!')).toMatch(/^org-[0-9a-f]{4}$/);
  });
});
