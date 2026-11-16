import { AuthError, ConfigError } from '@mariachi/core';

export interface GoTrueVerifiedEmailConfig {
  /** GoTrue's base URL as this server reaches it, path prefix included (e.g. `http://127.0.0.1:9999`, `https://<project>.supabase.co/auth/v1`). */
  url: string;
  /**
   * A key that may read users through GoTrue's admin API (a service-role key). A secret: it never
   * goes to a browser. Without it only a token that carries `email_verified` itself can be answered.
   */
  serviceKey?: string;
  /**
   * Take the answer only from the token's own `email_verified` claim: nothing is looked up, with a
   * key or without, and a token that lacks the claim is refused (`auth/verified-email-unavailable`).
   * For an app whose access token hook always sets the claim, which then needs no service key at all.
   */
  requireClaim?: boolean;
  /**
   * The issuer whose tokens this answers for: GoTrue's `iss`. A token from any other issuer is
   * answered unverified, and nothing is looked up for it. Set it when the app accepts tokens from
   * more than one issuer, so another provider's subject is never asked about here.
   */
  issuer?: string;
  /**
   * Count an address GoTrue confirmed without sending mail. GoTrue run with
   * `GOTRUE_MAILER_AUTOCONFIRM` marks every sign-up confirmed, so by default its records then answer
   * unverified. True takes them as verified anyway: for development, never for production.
   */
  trustAutoconfirm?: boolean;
  /** How long GoTrue's settings (whether it auto-confirms) are remembered, in ms. Default 60000. */
  settingsCacheMs?: number;
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
 *    `email`, verified when `email_confirmed_at` is set. If GoTrue confirms sign-ups without sending
 *    mail (`GOTRUE_MAILER_AUTOCONFIRM`, read from its `/settings`), that date proves nothing and the
 *    answer is unverified, unless `trustAutoconfirm` says otherwise.
 *
 * With neither, there is no answer to give, and it says so (`auth/verified-email-unavailable`)
 * rather than guess. A lookup that fails is an error too (`auth/user-lookup-failed`), never "verified".
 *
 * What it can't know: an address confirmed while GoTrue was auto-confirming stays confirmed in the
 * record after the setting is turned off.
 */
export function goTrueVerifiedEmail(config: GoTrueVerifiedEmailConfig): (ctx: object) => Promise<{ email?: string; verified?: boolean }> {
  if (!config.url) throw new AuthError('auth/invalid-config', 'GoTrue: `url` is required');
  const base = config.url.replace(/\/+$/, '');
  const request = config.fetch ?? fetch;
  const timeoutMs = config.timeoutMs ?? 5_000;
  const settingsCacheMs = config.settingsCacheMs ?? 60_000;

  const read = async (path: string, what: string, serviceKey: string): Promise<Response> => {
    try {
      return await request(`${base}${path}`, {
        headers: { accept: 'application/json', authorization: `Bearer ${serviceKey}`, apikey: serviceKey },
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new AuthError('auth/user-lookup-failed', `GoTrue: ${what} could not be read: ${(error as Error).message}`);
    }
  };

  let settings: { autoconfirm: boolean; until: number } | undefined;
  /** Whether GoTrue confirms sign-ups without sending mail. Remembered for a while; a failure is not. */
  const autoconfirms = async (serviceKey: string): Promise<boolean> => {
    if (settings && Date.now() < settings.until) return settings.autoconfirm;
    const res = await read('/settings', 'its settings', serviceKey);
    const body = res.ok ? ((await res.json().catch(() => null)) as { mailer_autoconfirm?: unknown } | null) : null;
    if (typeof body?.mailer_autoconfirm !== 'boolean') {
      throw new AuthError('auth/user-lookup-failed', `GoTrue: its settings did not say whether sign-ups are confirmed by mail (answered ${res.status})`);
    }
    settings = { autoconfirm: body.mailer_autoconfirm, until: Date.now() + settingsCacheMs };
    return settings.autoconfirm;
  };

  // Takes any request context (`Context` from `@mariachi/core`, or the API layer's own)
  return async (ctx) => {
    const claims = (ctx as VerifiedEmailContext).identity?.claims;
    if (!claims) return {};
    const email = text(claims.email);
    // Another issuer's token: its claims are not GoTrue's word, and its subject is not GoTrue's user
    if (config.issuer && claims.iss !== config.issuer) return { email, verified: false };
    if (typeof claims.email_verified === 'boolean') return { email, verified: claims.email_verified };
    if (config.requireClaim) {
      throw new ConfigError(
        'auth/verified-email-unavailable',
        'GoTrue: the token carries no top-level `email_verified` claim, and this app takes the answer only from that claim (`requireClaim`). Add the claim in the access token hook',
      );
    }
    const serviceKey = config.serviceKey;
    if (!serviceKey) {
      throw new ConfigError(
        'auth/verified-email-unavailable',
        'GoTrue: the token does not say whether the email address is verified, and no service key is set to look it up. Set `serviceKey`, or add a top-level `email_verified` claim in an access token hook',
      );
    }
    const subject = text(claims.sub);
    // GoTrue's user ids are UUIDs; anything else is not looked up
    if (!subject || !UUID.test(subject)) return { email, verified: false };
    // A confirmation GoTrue gave without sending mail says nothing about who owns the address
    if (!config.trustAutoconfirm && (await autoconfirms(serviceKey))) return { email, verified: false };

    const res = await read(`/admin/users/${subject}`, "the user's record", serviceKey);
    if (res.status === 404) return { email, verified: false };
    if (!res.ok) throw new AuthError('auth/user-lookup-failed', `GoTrue: reading the user's record answered ${res.status}`);
    const user = (await res.json().catch(() => null)) as { id?: unknown; email?: unknown; email_confirmed_at?: unknown } | null;
    if (!user || user.id !== subject) throw new AuthError('auth/user-lookup-failed', "GoTrue: the user's record did not come back as expected");
    return { email: text(user.email), verified: text(user.email_confirmed_at) !== undefined };
  };
}
