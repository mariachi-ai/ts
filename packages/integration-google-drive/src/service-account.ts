import { type Context, ConfigError } from '@mariachi/core';
import { type ProviderDeps, providerRequest } from '@mariachi/integrations';
import { importPKCS8, SignJWT } from 'jose';
import { z } from 'zod';
import { GoogleDriveError, failure } from './errors';
import { provider } from './generated';

/** Where a service account's signed JWT is exchanged for an access token, and the JWT's `aud`. */
export const TOKEN_URL = 'https://oauth2.googleapis.com/token';

/** The scope for the app's own Drive: every file the service account (or the user it acts as) can reach. */
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive';

/** A service account's JSON key, as Google Cloud downloads it. Only these fields are read. */
const ServiceAccountKey = z
  .object({
    client_email: z.string().email(),
    private_key: z.string().includes('PRIVATE KEY'),
    private_key_id: z.string().optional(),
  })
  .passthrough();

const TokenResponse = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() }).passthrough();

/** Renew this long before Google's expiry, so a token never lapses mid-call. */
const EARLY_MS = 5 * 60_000;
/** Google allows at most an hour between `iat` and `exp`. */
const JWT_LIFETIME_S = 3600;

export interface ServiceAccountTokens {
  get(ctx: Context): Promise<string>;
  /** Forget the cached token: Drive refused it. */
  invalidate(): void;
}

/** Reads the key at startup, so a bad value stops the app then rather than at its first call. Never echoes it. */
export function parseServiceAccountKey(json: string): z.infer<typeof ServiceAccountKey> {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    raw = undefined;
  }
  const parsed = ServiceAccountKey.safeParse(raw);
  if (!parsed.success) {
    throw new ConfigError('google-drive/invalid-service-account', "GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON isn't a service account's JSON key (client_email and private_key)");
  }
  return parsed.data;
}

/**
 * Access tokens for a service account: a JWT signed with its key (RS256) and exchanged at Google's token endpoint
 * (`google-drive auth.token`), cached until five minutes before it expires. Calls that arrive together share one
 * exchange. `subject` is the Workspace user it acts as, with domain-wide delegation.
 */
export function serviceAccountTokens(
  key: z.infer<typeof ServiceAccountKey>,
  options: { scope: string; subject?: string; deps: ProviderDeps & { fetch?: typeof fetch } },
): ServiceAccountTokens {
  const now = options.deps.now ?? Date.now;
  let cached: { token: string; renewAt: number } | undefined;
  let pending: Promise<string> | undefined;
  let signingKey: ReturnType<typeof importPKCS8> | undefined;

  async function sign(): Promise<string> {
    signingKey ??= importPKCS8(key.private_key, 'RS256').catch(() => {
      signingKey = undefined;
      throw new ConfigError('google-drive/invalid-service-account', "The service account's private_key can't be read as an RS256 PKCS#8 key");
    });
    const iat = Math.floor(now() / 1000);
    const jwt = new SignJWT({ scope: options.scope })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT', ...(key.private_key_id ? { kid: key.private_key_id } : {}) })
      .setIssuer(key.client_email)
      .setAudience(TOKEN_URL)
      .setIssuedAt(iat)
      .setExpirationTime(iat + JWT_LIFETIME_S);
    if (options.subject) jwt.setSubject(options.subject);
    return jwt.sign(await signingKey);
  }

  async function exchange(ctx: Context): Promise<string> {
    const assertion = await sign();
    const answer = await providerRequest(
      ctx,
      { integration: provider.id, operation: 'auth.token', category: provider.category, server: new URL(TOKEN_URL).host },
      { method: 'POST', url: TOKEN_URL, form: { grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion } },
      // Asking for a token twice is harmless, so an outage is retried too
      { schema: TokenResponse, error: GoogleDriveError, failure, deps: { ...options.deps, retry: { unsafe: false, ...options.deps.retry } } },
    );
    cached = { token: answer.access_token, renewAt: now() + Math.max(0, answer.expires_in * 1000 - EARLY_MS) };
    return answer.access_token;
  }

  return {
    async get(ctx) {
      if (cached && now() < cached.renewAt) return cached.token;
      pending ??= exchange(ctx).finally(() => {
        pending = undefined;
      });
      return pending;
    },
    invalidate() {
      cached = undefined;
    },
  };
}
