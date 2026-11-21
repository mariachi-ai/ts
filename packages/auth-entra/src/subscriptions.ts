import { AuthError, type Context, fromZodError } from '@mariachi/core';
import { z } from 'zod';
import { GRAPH, type EntraDeps, appTokenSource, endpoints, entraRequest } from './endpoints';
import { EntraError } from './errors';
import type { EntraOperation } from './generated';
import { RenewInput, SubscribeUsersInput, Subscription, SubscriptionList } from './schemas';

/** The longest a subscription on users may last, in minutes (Microsoft Graph's limit: under 29 days). */
export const USER_SUBSCRIPTION_MAX_MINUTES = 41_760;
/** What the helper asks for by default: the limit less five minutes, so a fast clock here doesn't exceed it. */
const DEFAULT_MINUTES = USER_SUBSCRIPTION_MAX_MINUTES - 5;

export interface EntraSubscriptionsConfig {
  tenantId: string;
  clientId: string;
  clientSecret: string;
  authority?: string;
  /** The clientState every notification carries back: `ENTRA_WEBHOOK_CLIENT_STATE`, at most 128 characters. */
  webhookClientState: string;
}

/**
 * Microsoft Graph subscriptions to the directory's users, so the app hears when one changes. A subscription lasts
 * at most 41,760 minutes and then stops without a word: run `ensureUsers` from a scheduled job (daily is plenty)
 * and it creates the subscription, or renews the one already there. Graph checks the notification URL while
 * creating it, so the app's `WebhookController` route must already be live.
 *
 * Needs the app permission `User.Read.All` (or `User.ReadWrite.All`), admin-consented.
 */
export function createEntraSubscriptions(config: EntraSubscriptionsConfig, deps: EntraDeps = {}) {
  const parsed = Config.safeParse(config);
  if (!parsed.success) throw new AuthError('auth/invalid-config', `Entra subscriptions: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  const cfg = parsed.data;
  const ep = endpoints(cfg);
  const appToken = appTokenSource(ep, cfg, deps);
  const now = deps.now ?? Date.now;
  const expiry = (minutes = DEFAULT_MINUTES) => new Date(now() + minutes * 60_000).toISOString();

  async function call<T>(ctx: Context, operation: EntraOperation, request: { method: 'GET' | 'POST' | 'PATCH' | 'DELETE'; url: string; json?: unknown }, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const token = await appToken(ctx);
    return entraRequest(ctx, deps, operation, { ...request, headers: { authorization: `Bearer ${token}` } }, schema);
  }

  const subscriptions = {
    /** Subscribes `notificationUrl` to the users' changes. Graph refuses a second one with the same changes (409). */
    async create(ctx: Context, input: SubscribeUsersInput): Promise<Subscription> {
      const i = parse(SubscribeUsersInput, input);
      return call(
        ctx,
        'subscriptions.create',
        {
          method: 'POST',
          url: `${GRAPH}/subscriptions`,
          json: { changeType: i.changeTypes.join(','), notificationUrl: i.notificationUrl, resource: 'users', expirationDateTime: expiry(i.expiresInMinutes), clientState: cfg.webhookClientState },
        },
        Subscription,
      );
    },
    /** Moves the subscription's expiry to `expiresInMinutes` from now (default: as late as Graph allows). */
    async renew(ctx: Context, input: RenewInput): Promise<Subscription> {
      const i = parse(RenewInput, input);
      return call(ctx, 'subscriptions.renew', { method: 'PATCH', url: `${GRAPH}/subscriptions/${encodeURIComponent(i.subscriptionId)}`, json: { expirationDateTime: expiry(i.expiresInMinutes) } }, Subscription);
    },
    /** The app's active subscriptions, every page. */
    async list(ctx: Context): Promise<Subscription[]> {
      const all: Subscription[] = [];
      let url: string | undefined = `${GRAPH}/subscriptions`;
      for (let page = 0; url && page < 20; page++) {
        const res: z.infer<typeof SubscriptionList> = await call(ctx, 'subscriptions.list', { method: 'GET', url }, SubscriptionList);
        all.push(...res.value);
        const next = res['@odata.nextLink'];
        url = next && new URL(next).origin === new URL(GRAPH).origin ? next : undefined;
      }
      return all;
    },
    /** Ends the subscription; one already gone is no error. */
    async delete(ctx: Context, subscriptionId: string): Promise<void> {
      try {
        await call(ctx, 'subscriptions.delete', { method: 'DELETE', url: `${GRAPH}/subscriptions/${encodeURIComponent(subscriptionId)}` }, z.unknown());
      } catch (error) {
        if (error instanceof EntraError && error.category === 'not-found') return;
        throw error;
      }
    },
    /**
     * Makes sure `notificationUrl` is subscribed to the users' changes for as long as Graph allows: renews this
     * app's subscription on users to that URL when there is one, creates it otherwise. Safe to run at every deploy
     * and from a daily job.
     */
    async ensureUsers(ctx: Context, input: SubscribeUsersInput): Promise<Subscription> {
      const i = parse(SubscribeUsersInput, input);
      const existing = (await subscriptions.list(ctx)).find((s) => s.resource.replace(/^\/+/, '').toLowerCase() === 'users' && s.notificationUrl === i.notificationUrl);
      if (existing) return subscriptions.renew(ctx, { subscriptionId: existing.id, expiresInMinutes: i.expiresInMinutes });
      return subscriptions.create(ctx, i);
    },
  };
  return subscriptions;
}

export type EntraSubscriptions = ReturnType<typeof createEntraSubscriptions>;

const Config = z.object({
  tenantId: z.string().min(1),
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  authority: z.string().min(1).optional(),
  webhookClientState: z.string().min(1).max(128, 'Graph allows a clientState of at most 128 characters'),
});

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) throw fromZodError(parsed.error, 'Invalid Entra subscription input');
  return parsed.data;
}
