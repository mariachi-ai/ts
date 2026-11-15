import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';
import { AuthError } from '@mariachi/core';
import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import type { AsymmetricAlgorithm, ClaimSource, OidcClaims, OidcConfig } from './types';

const HMAC = /^HS/i;

/** Claims a user can set or change at their provider, which must never identify them (account takeover by editing a profile). */
const MUTABLE_IDENTITY_CLAIMS = new Set(['email', 'preferred_username', 'upn', 'unique_name', 'name', 'nickname', 'given_name', 'family_name', 'phone_number']);

function read<T>(claims: OidcClaims, source: ClaimSource<T>): unknown {
  return typeof source === 'function' ? source(claims) : claims[source];
}

/** A claim that's one string or a list of them; a space-separated string when `split` is set. */
function strings(value: unknown, split = false): string[] {
  if (typeof value === 'string') return split ? value.split(/\s+/).filter(Boolean) : value ? [value] : [];
  if (Array.isArray(value)) return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
  return [];
}

/** The local machine, where plain HTTP is allowed (development, tests, a sidecar). */
function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '::1' || hostname === '[::1]' || /^127(\.\d{1,3}){3}$/.test(hostname);
}

/** Keys and the issuer's identity travel over these URLs, so they're HTTPS unless they stay on this machine. */
function requireSecureUrl(value: string, what: string, code: 'auth/invalid-config' | 'auth/invalid-token'): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new AuthError(code, `OIDC: ${what} is not a URL`);
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalHost(url.hostname))) {
    throw new AuthError(code, `OIDC: ${what} must be https:// (http:// is accepted for localhost only)`);
  }
  return value;
}

/**
 * Whether a verified token says it's an access token: RFC 9068's `typ: at+jwt` header, Amazon
 * Cognito's `token_use: access`, or Keycloak's `typ: Bearer` claim.
 */
function looksLikeAccessToken(header: { typ?: string }, claims: OidcClaims): boolean {
  const typ = header.typ?.toLowerCase().replace(/^application\//, '');
  return typ === 'at+jwt' || claims.token_use === 'access' || claims.typ === 'Bearer';
}

function sources<T>(value: ClaimSource<T> | Array<ClaimSource<T>> | undefined, fallback: string[]): Array<ClaimSource<T>> {
  if (value === undefined) return fallback;
  return Array.isArray(value) ? value : [value];
}

/**
 * Verifies tokens from any OpenID Connect provider against its published keys and maps them onto
 * `ResolvedIdentity`:
 *
 * - `sub` → `userId`; the session claim (`sid`) → `sessionId`;
 * - the tenant claim (`org_id` by default) → `tenantId`, empty when the token has none;
 * - the role claims → `roles`; the scope claims → `scopes` (plus the roles, with `rolesAsScopes`);
 * - the whole verified payload → `claims`, which the auth middleware passes on to tenancy.
 *
 * The signature, `iss`, `aud`, `exp` and `nbf` are checked on every call; only asymmetric
 * algorithms are accepted.
 */
export class OidcAuthProvider implements AuthProvider {
  readonly name = 'oidc';

  private readonly algorithms: AsymmetricAlgorithm[];
  private readonly maxAgeMs: number;
  private keys?: { get: JWTVerifyGetKey; url: string; expiresAt: number };
  private loading?: Promise<JWTVerifyGetKey>;

  constructor(
    private readonly config: OidcConfig,
    /** A key set to use in place of the provider's published one (tests). */
    private readonly jwks?: JWTVerifyGetKey,
  ) {
    if (!config.issuer) throw new AuthError('auth/invalid-config', 'OIDC: `issuer` is required');
    requireSecureUrl(config.issuer, '`issuer`', 'auth/invalid-config');
    if (config.discoveryUrl) requireSecureUrl(config.discoveryUrl, '`discoveryUrl`', 'auth/invalid-config');
    if (config.jwksUrl) requireSecureUrl(config.jwksUrl, '`jwksUrl`', 'auth/invalid-config');
    if (config.audience === undefined || (Array.isArray(config.audience) ? config.audience.length === 0 : config.audience === '')) {
      throw new AuthError('auth/invalid-config', 'OIDC: `audience` is required (pass null only for a provider whose tokens have no aud, with a `validate` that checks them)');
    }
    if (config.audience === null && !config.validate) {
      throw new AuthError('auth/invalid-config', 'OIDC: `audience: null` needs a `validate` function, or any token from this issuer would be accepted');
    }
    if (typeof config.userIdClaim === 'string' && MUTABLE_IDENTITY_CLAIMS.has(config.userIdClaim.toLowerCase())) {
      throw new AuthError(
        'auth/invalid-config',
        `OIDC: \`userIdClaim: '${config.userIdClaim}'\` is a claim a user can set or change, so it can't identify them; use an id the provider assigns, such as \`sub\` or Entra's \`oid\``,
      );
    }
    this.algorithms = config.algorithms?.length ? config.algorithms : ['RS256', 'ES256'];
    if (this.algorithms.some((algorithm) => HMAC.test(algorithm))) {
      throw new AuthError('auth/invalid-config', 'OIDC: HMAC algorithms are not accepted; verify through the JWKS');
    }
    this.maxAgeMs = config.jwksCacheMaxAgeMs ?? 60_000;
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    const keys = this.jwks ?? (await this.keySet());
    let claims: OidcClaims;
    let header: { typ?: string };
    try {
      const result = await jwtVerify(token, keys, {
        algorithms: this.algorithms,
        issuer: this.config.issuer,
        audience: this.config.audience ?? undefined,
        clockTolerance: this.config.clockToleranceSeconds ?? 5,
        requiredClaims: ['sub', 'exp'],
        typ: this.config.requireTokenType,
      });
      claims = result.payload as OidcClaims;
      header = result.protectedHeader;
    } catch (error) {
      throw new AuthError('auth/invalid-token', `OIDC token verification failed: ${(error as Error).message}`);
    }
    // Everything below runs on a token whose signature, issuer, audience and times already hold.
    if (this.config.tokenType === 'access' && !looksLikeAccessToken(header, claims)) {
      throw new AuthError('auth/invalid-token', 'OIDC token refused: not an access token');
    }
    if (this.config.authorizedParty !== undefined) {
      const allowed = Array.isArray(this.config.authorizedParty) ? this.config.authorizedParty : [this.config.authorizedParty];
      const party = typeof claims.azp === 'string' ? claims.azp : claims.client_id;
      if (typeof party !== 'string' || !allowed.includes(party)) {
        throw new AuthError('auth/invalid-token', 'OIDC token refused: issued to a client that is not allowed');
      }
    }
    if (this.config.validate) {
      try {
        await this.config.validate(claims);
      } catch (error) {
        if (error instanceof AuthError) throw error;
        throw new AuthError('auth/invalid-token', `OIDC token refused: ${(error as Error).message}`);
      }
    }
    return this.toIdentity(claims);
  }

  /**
   * The provider's keys: from `jwksUrl`, or the `jwks_uri` its discovery document names. One
   * discovery at a time. When the document can't be re-read, the keys already in hand keep being
   * used (they were the issuer's own) and discovery is tried again on the next call, so a blip at
   * the provider doesn't sign everyone out.
   */
  private async keySet(): Promise<JWTVerifyGetKey> {
    if (this.keys && (this.config.jwksUrl || this.keys.expiresAt > Date.now())) return this.keys.get;
    const known = this.keys;
    this.loading ??= this.locateKeys()
      .then((url) => {
        if (known?.url === url) {
          known.expiresAt = Date.now() + this.maxAgeMs;
          return known.get;
        }
        const get = createRemoteJWKSet(new URL(url), { cacheMaxAge: this.maxAgeMs, cooldownDuration: this.config.jwksCooldownMs ?? 5_000 });
        this.keys = { get, url, expiresAt: Date.now() + this.maxAgeMs };
        return get;
      })
      .catch((error: unknown) => {
        if (known) return known.get;
        throw error;
      })
      .finally(() => {
        this.loading = undefined;
      });
    return this.loading;
  }

  private async locateKeys(): Promise<string> {
    if (this.config.jwksUrl) return this.config.jwksUrl;
    const url = this.config.discoveryUrl ?? `${this.config.issuer.replace(/\/+$/, '')}/.well-known/openid-configuration`;
    let document: { issuer?: unknown; jwks_uri?: unknown } | null;
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(5_000) });
      if (!res.ok) throw new AuthError('auth/invalid-token', `OIDC discovery failed: ${url} answered ${res.status}`);
      document = (await res.json()) as { issuer?: unknown; jwks_uri?: unknown } | null;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('auth/invalid-token', `OIDC discovery failed: ${(error as Error).message}`);
    }
    // The document must be the configured issuer's own, or its keys could be anyone's.
    if (document?.issuer !== this.config.issuer) {
      throw new AuthError('auth/invalid-token', `OIDC discovery: the document at ${url} names a different issuer than the one configured`);
    }
    if (typeof document.jwks_uri !== 'string' || !document.jwks_uri) {
      throw new AuthError('auth/invalid-token', `OIDC discovery: the document at ${url} has no jwks_uri`);
    }
    return requireSecureUrl(document.jwks_uri, "the discovery document's jwks_uri", 'auth/invalid-token');
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(claims: OidcClaims): ResolvedIdentity {
    const userId = read(claims, this.config.userIdClaim ?? 'sub');
    if (typeof userId !== 'string' || !userId) throw new AuthError('auth/invalid-token', 'OIDC token has no subject');
    const roles = [...new Set(sources(this.config.rolesClaim, ['roles']).flatMap((source) => strings(read(claims, source))))];
    const granted = sources(this.config.scopesClaim, ['scope', 'scp', 'permissions']).flatMap((source) => strings(read(claims, source), true));
    const tenant = read(claims, this.config.tenantClaim ?? 'org_id');
    const session = read(claims, this.config.sessionClaim ?? 'sid');
    return {
      userId,
      tenantId: typeof tenant === 'string' ? tenant : '',
      scopes: [...new Set([...(this.config.rolesAsScopes ? roles : []), ...granted])],
      roles,
      identityType: 'session',
      sessionId: typeof session === 'string' && session ? session : undefined,
      claims: { ...claims },
    };
  }

  /** OpenID Connect defines no webhooks. Use your provider's own, with a verifier from `@mariachi/webhooks`. */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError('auth/not-supported', 'OIDC defines no webhooks; verify your provider\'s own with @mariachi/webhooks');
  }
}
