export { EntraAuthProvider, type EntraAuthConfig } from './provider';
export { EntraIdentityClient, type EntraIdentityClientConfig } from './identity-client';
export { createEntraSubscriptions, USER_SUBSCRIPTION_MAX_MINUTES, type EntraSubscriptions, type EntraSubscriptionsConfig } from './subscriptions';
export { EntraWebhookAuth, EntraNotificationBody, entraWebhookAuth, entraEventType, entraAuthEvents } from './webhooks';
export { EntraError } from './errors';
export type { EntraDeps } from './endpoints';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type EntraConfig, type EntraOperation } from './generated';
export type { ChangeNotification, Subscription, SubscribeUsersInput, RenewInput } from './schemas';

import type { EntraDeps } from './endpoints';
import { EntraIdentityClient, type EntraIdentityClientConfig } from './identity-client';
import { type EntraAuthConfig, EntraAuthProvider } from './provider';

/** An `AuthProvider` for the tenant's access tokens. Pass it to `bearerStrategy` or `createAuthMiddleware`. */
export function createEntraAuth(config: EntraAuthConfig, deps: EntraDeps = {}): EntraAuthProvider {
  return new EntraAuthProvider(config, deps);
}

/** An `IdentityClient` for sign-in, refresh and the directory's users. */
export function createEntraIdentityClient(config: EntraIdentityClientConfig, deps: EntraDeps = {}): EntraIdentityClient {
  return new EntraIdentityClient(config, deps);
}
