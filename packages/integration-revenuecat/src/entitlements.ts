import type { CustomerEntitlement, WebhookEvent } from './schemas';

/** A customer as `customers.get` answers it, or just its active entitlements. */
export type HasEntitlements = { active_entitlements: { items: readonly CustomerEntitlement[] } } | readonly CustomerEntitlement[];

/**
 * The ids (`entl…`) of the entitlements the customer has at `now`. RevenueCat lists what was active when it
 * answered; an entitlement whose `expires_at` has passed since is left out, so a customer read a while ago (a
 * cached one) still answers right. An entitlement with no `expires_at` doesn't end.
 */
export function activeEntitlements(customer: HasEntitlements, now: Date | number = Date.now()): string[] {
  const at = typeof now === 'number' ? now : now.getTime();
  const items = Array.isArray(customer) ? customer : (customer as { active_entitlements: { items: readonly CustomerEntitlement[] } }).active_entitlements.items;
  return [...new Set(items.filter((e) => e.expires_at === null || e.expires_at > at).map((e) => e.entitlement_id))];
}

/**
 * Whether the customer has the entitlement at `now`, by its id (`entl…`, from `entitlements.list` or the
 * dashboard), not its lookup key. Check entitlements, not products or subscriptions: an entitlement is what
 * RevenueCat unlocks for every store, promotional grant and family share alike.
 */
export function isEntitled(customer: HasEntitlements, entitlementId: string, now: Date | number = Date.now()): boolean {
  return activeEntitlements(customer, now).includes(entitlementId);
}

/**
 * The App User IDs a webhook event is about: the ones to fetch again with `customers.get`. Usually the event's
 * `app_user_id`; for a TRANSFER, both sides (`transferred_from` and `transferred_to`), since both changed.
 */
export function customersToRefresh(event: Pick<WebhookEvent, 'app_user_id' | 'transferred_from' | 'transferred_to'>): string[] {
  const ids = [event.app_user_id, ...(event.transferred_from ?? []), ...(event.transferred_to ?? [])];
  return [...new Set(ids.filter((id): id is string => typeof id === 'string' && id.length > 0))];
}
