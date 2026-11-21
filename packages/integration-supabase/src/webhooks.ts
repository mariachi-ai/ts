import { StandardWebhookAuth } from '@mariachi/webhooks';
import { provider } from './generated';

/**
 * The authenticator for a `WebhookController` that receives Supabase Auth's HTTP hooks: Standard Webhooks
 * (`webhook-id`, `webhook-timestamp`, `webhook-signature`), keyed with the hook's secret as the dashboard gives
 * it, `v1,whsec_<base64>`. Pass two (an array, or joined with `|`) while rotating. A delivery that doesn't match
 * is answered 401, and one already seen is deduplicated on its signed `webhook-id`.
 *
 * Each hook has its own URL, so give each its own route. Through `WebhookServer` the hooks that need no answer
 * fit: Send Email and Send SMS, queued (Supabase takes the 202 and goes on). The hooks whose answer Supabase
 * reads (Custom Access Token, Before User Created, MFA and Password Verification Attempt) don't: `WebhookServer`
 * answers with its own acknowledgement, not a procedure's result. Write those as Postgres function hooks.
 *
 * ```ts
 * class SupabaseHooks extends WebhookController {
 *   readonly prefix = 'supabase';
 *   readonly auth = supabaseAuthHookAuth(config.supabase.authHookSecret);
 *   init() {
 *     this.post('send-email', { mode: 'queue', jobName: 'auth-email', eventType: supabaseAuthHookType, logPayload: false },
 *       async (_ctx, body) => SendEmailHookBody.parse(body));
 *   }
 * }
 * ```
 *
 * Database Webhooks (`pg_net`, `supabase_functions.http_request`) are not signed: anyone who learns the URL can
 * post to it. Don't take one as proof of anything; have the job read the row it names back from the database.
 */
export function supabaseAuthHookAuth(secret: string | string[]): StandardWebhookAuth {
  return new StandardWebhookAuth({ provider: provider.id, secret });
}

/** The hook a delivery is, from its body, for its span: `eventType: supabaseAuthHookType` on the route. */
export function supabaseAuthHookType(payload: unknown): 'send-email' | 'send-sms' | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  if (typeof (payload as { email_data?: unknown }).email_data === 'object') return 'send-email';
  if (typeof (payload as { sms?: unknown }).sms === 'object') return 'send-sms';
  return undefined;
}
