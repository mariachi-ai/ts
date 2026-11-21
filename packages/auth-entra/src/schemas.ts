import { z } from 'zod';

/** The part of the OpenID configuration this package reads. */
export const Discovery = z
  .object({
    issuer: z.string().url(),
    jwks_uri: z.string().url(),
    authorization_endpoint: z.string().url().optional(),
    token_endpoint: z.string().url().optional(),
    end_session_endpoint: z.string().url().optional(),
  })
  .passthrough();
export type Discovery = z.infer<typeof Discovery>;

/** A signing key. Entra adds `issuer`, which can hold a `{tenantid}` placeholder. */
export const Jwk = z.object({ kid: z.string().min(1), kty: z.string(), issuer: z.string().optional() }).passthrough();
export const KeySet = z.object({ keys: z.array(Jwk) }).passthrough();
export type Jwk = z.infer<typeof Jwk>;

export const TokenResponse = z
  .object({
    access_token: z.string().min(1),
    token_type: z.string().optional(),
    expires_in: z.coerce.number().optional(),
    refresh_token: z.string().optional(),
    id_token: z.string().optional(),
    scope: z.string().optional(),
  })
  .passthrough();
export type TokenResponse = z.infer<typeof TokenResponse>;

export const ObjectIdentity = z.object({ signInType: z.string().nullish(), issuer: z.string().nullish(), issuerAssignedId: z.string().nullish() }).passthrough();

/** A Microsoft Graph user, as `$select=id,displayName,mail,userPrincipalName,identities` returns it. */
export const GraphUser = z
  .object({
    id: z.string().min(1),
    displayName: z.string().nullish(),
    mail: z.string().nullish(),
    userPrincipalName: z.string().nullish(),
    identities: z.array(ObjectIdentity).nullish(),
  })
  .passthrough();
export type GraphUser = z.infer<typeof GraphUser>;

export const GraphUserList = z.object({ value: z.array(GraphUser) }).passthrough();

/** A Microsoft Graph subscription (the fields an app reads back). */
export const Subscription = z
  .object({
    id: z.string().min(1),
    resource: z.string(),
    changeType: z.string(),
    notificationUrl: z.string(),
    expirationDateTime: z.string(),
  })
  .passthrough();
export type Subscription = z.infer<typeof Subscription>;

export const SubscriptionList = z.object({ value: z.array(Subscription), '@odata.nextLink': z.string().url().optional() }).passthrough();

const HttpsUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith('https://'), 'Graph only delivers to an https:// notification URL');

export const SubscribeUsersInput = z.object({
  /** Where Graph posts the notifications: the app's `WebhookController` route, https only. */
  notificationUrl: HttpsUrl,
  /** Default both: `updated` (created, changed or soft-deleted) and `deleted` (deleted for good). */
  changeTypes: z.array(z.enum(['updated', 'deleted'])).min(1).default(['updated', 'deleted']),
  /** How long until it expires. Default and most: the users limit, 41,760 minutes, less five for clock skew. */
  expiresInMinutes: z.number().int().min(45).max(41_760).optional(),
});
export type SubscribeUsersInput = z.input<typeof SubscribeUsersInput>;

export const RenewInput = z.object({ subscriptionId: z.string().min(1), expiresInMinutes: z.number().int().min(45).max(41_760).optional() });
export type RenewInput = z.input<typeof RenewInput>;

/** One change notification: the resource's id, never the resource itself. */
export const ChangeNotification = z
  .object({
    id: z.string().optional(),
    subscriptionId: z.string(),
    subscriptionExpirationDateTime: z.string().optional(),
    clientState: z.string().nullish(),
    changeType: z.enum(['created', 'updated', 'deleted']).or(z.string()),
    resource: z.string(),
    tenantId: z.string().optional(),
    resourceData: z.object({ '@odata.type': z.string().optional(), '@odata.id': z.string().optional(), id: z.string().optional() }).passthrough().nullish(),
  })
  .passthrough();
export type ChangeNotification = z.infer<typeof ChangeNotification>;

/** What Graph posts to the notification URL: one or more notifications, possibly from several subscriptions. */
export const EntraNotificationBody = z.object({ value: z.array(ChangeNotification).min(1) }).passthrough();
export type EntraNotificationBody = z.infer<typeof EntraNotificationBody>;
