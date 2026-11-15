import { AuthError, ConfigError } from '@mariachi/core';

export interface GoTrueVerifiedEmailConfig {
  /** GoTrue's base URL as this server reaches it, path prefix included (e.g. `http://127.0.0.1:9999`, `https://<project>.supabase.co/auth/v1`). */
  url: string;
  /**
   * A key that may read users through GoTrue's admin API (a service-role key). A secret: it never
   * goes to a browser. Without it only a token that carries `email_verified` itself can be answered.
   */
  serviceKey?: string;
  /** How long to wait for GoTrue, in ms. Default 5000. */
  timeoutMs?: number;
  /** In place of the global `fetch` (tests). */
  fetch?: typeof fetch;
}

/** What this reads of a request's context: the verified token's claims, where the API layer puts them. */
export interface VerifiedEmailContext {
  identity?: { claims?: Record<string, unknown> } | null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);

/**
 * Says whether the signed-in user's email address is verified, for anything that must not take the
 * user's word for it (`verifiedEmail` of `@mariachi/organizations`, which decides who may accept an
 * invitation):
 *
 * ```ts
 * new DefaultOrganizations({ store, verifiedEmail: goTrueVerifiedEmail({ url, serviceKey }) });
 * ```
 *
 * GoTrue's access token carries `email`, and `email_verified` only inside `user_metadata`, which a
 * signed-in user can rewrite. So `user_metadata` is never read. The answer comes from:
 *
 * 1. a top-level `email_verified` claim, when the token has one (a custom access token hook of yours
 *    adds it): its value, true or false, with the token's `email`;
 * 2. otherwise the user's own record, read from GoTrue's admin API with `serviceKey`: the record's
 *    `email`, verified when `email_confirmed_at` is set.
 *
 * With neither, there is no answer to give, and it says so (`auth/verified-email-unavailable`)
 * rather than guess. A lookup that fails is an error too, never "verified".
 *
 * `email_confirmed_at` means something only when GoTrue confirms by sending mail: with
 * `GOTRUE_MAILER_AUTOCONFIRM` every address is confirmed at sign-up.
 */
export function goTrueVerifiedEmail(config: GoTrueVerifiedEmailConfig): (ctx: object) => Promise<{ email?: string; verified?: boolean }> {
  if (!config.url) throw new AuthError('auth/invalid-config', 'GoTrue: `url` is required');
  const base = config.url.replace(/\/+$/, '');
  const request = config.fetch ?? fetch;
  const timeoutMs = config.timeoutMs ?? 5_000;

  // Takes any request context (`Context` from `@mariachi/core`, or the API layer's own)
  return async (ctx) => {
    const claims = (ctx as VerifiedEmailContext).identity?.claims;
    if (!claims) return {};
    if (typeof claims.email_verified === 'boolean') return { email: text(claims.email), verified: claims.email_verified };
    if (!config.serviceKey) {
      throw new ConfigError(
        'auth/verified-email-unavailable',
        'GoTrue: the token does not say whether the email address is verified, and no service key is set to look it up. Set `serviceKey`, or add a top-level `email_verified` claim in an access token hook',
      );
    }
    const subject = text(claims.sub);
    // GoTrue's user ids are UUIDs; anything else is not looked up
    if (!subject || !UUID.test(subject)) return { email: text(claims.email), verified: false };

    let res: Response;
    try {
      res = await request(`${base}/admin/users/${subject}`, {
        headers: { accept: 'application/json', authorization: `Bearer ${config.serviceKey}`, apikey: config.serviceKey },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new AuthError('auth/user-lookup-failed', `GoTrue: the user's record could not be read: ${(error as Error).message}`);
    }
    if (res.status === 404) return { email: text(claims.email), verified: false };
    if (!res.ok) throw new AuthError('auth/user-lookup-failed', `GoTrue: reading the user's record answered ${res.status}`);
    const user = (await res.json().catch(() => null)) as { id?: unknown; email?: unknown; email_confirmed_at?: unknown } | null;
    if (!user || user.id !== subject) throw new AuthError('auth/user-lookup-failed', "GoTrue: the user's record did not come back as expected");
    return { email: text(user.email), verified: text(user.email_confirmed_at) !== undefined };
  };
}
