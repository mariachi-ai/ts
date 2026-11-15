import { RealtimeError } from '@mariachi/core';
import type { ChannelAuthorizer } from './types';

/**
 * Default channel policy, deny-by-default:
 * - `public:<name>`: anyone may subscribe; publishing is denied.
 * - `tenant:<tenantId>[:...]`: members of that tenant only.
 * - `user:<userId>[:...]`: that user only (and only within their tenant, if the channel is tenant-prefixed).
 * - `tenant:<tenantId>:user:<userId>[:...]`: both checks.
 * Anything else is denied. Pass your own `authorize` to extend it.
 *
 * A channel is matched against the caller's own tenant and user id as whole prefixes, never by
 * splitting on `:`. An id that itself contains a colon is refused here: `tenant:a:b:chat` would
 * then read both as tenant `a`'s channel `b:chat` and as tenant `a:b`'s channel `chat`, and one
 * tenant could listen to another. Apps whose ids contain colons pass their own `authorize`.
 */
export const defaultChannelAuthorizer: ChannelAuthorizer = (identity, channel, action) => {
  if (channel.startsWith('public:')) return action === 'subscribe' && channel.length > 'public:'.length;

  let rest = channel;
  let inTenant = false;
  if (channel === 'tenant' || channel.startsWith('tenant:')) {
    const tenantId = identity.tenantId;
    if (!tenantId || tenantId.includes(':')) return false;
    const own = `tenant:${tenantId}`;
    if (channel === own) return true;
    if (!channel.startsWith(`${own}:`)) return false;
    rest = channel.slice(own.length + 1);
    inTenant = true;
  }

  if (rest === 'user' || rest.startsWith('user:')) {
    const userId = identity.userId;
    if (!userId || userId.includes(':')) return false;
    const who = rest.slice('user:'.length);
    return who === userId || who.startsWith(`${userId}:`);
  }
  return inTenant && rest.length > 0;
};

function channelId(kind: 'tenant' | 'user', id: string): string {
  if (!id) throw new RealtimeError('realtime/invalid-channel', `A ${kind} channel needs a ${kind} id`);
  if (id.includes(':')) {
    throw new RealtimeError('realtime/invalid-channel', `A ${kind} id containing ":" can't be used in a channel name: it could be read as another ${kind}'s channel`);
  }
  return id;
}

/**
 * The name of a tenant's channel, as the default authorizer reads it: `tenantChannel('t1', 'chat',
 * 'general')` is `tenant:t1:chat:general`. Build the names you `broadcast` to with this, so a tenant
 * id that contains a colon is refused instead of landing on another tenant's channel.
 */
export function tenantChannel(tenantId: string, ...segments: string[]): string {
  return ['tenant', channelId('tenant', tenantId), ...segments].join(':');
}

/** The name of a user's channel: `userChannel('u1', 'inbox')` is `user:u1:inbox`. */
export function userChannel(userId: string, ...segments: string[]): string {
  return ['user', channelId('user', userId), ...segments].join(':');
}

/** A user's channel inside a tenant: `tenantUserChannel('t1', 'u1', 'inbox')` is `tenant:t1:user:u1:inbox`. */
export function tenantUserChannel(tenantId: string, userId: string, ...segments: string[]): string {
  return tenantChannel(tenantId, 'user', channelId('user', userId), ...segments);
}
