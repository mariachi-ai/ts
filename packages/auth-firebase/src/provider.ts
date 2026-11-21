import type { AuthProvider, AuthWebhookHandler, ResolvedIdentity } from '@mariachi/auth';
import { AuthError } from '@mariachi/core';
import { type JWK, type JWTPayload, decodeProtectedHeader, importJWK, jwtVerify } from 'jose';
import { type FirebaseApi, type FirebaseDeps, createFirebaseApi } from './api';
import type { KeySet } from './schemas';

export interface FirebaseAuthConfig {
  /** `FIREBASE_PROJECT_ID`: every token's `aud`, and its `iss` is `https://securetoken.google.com/<projectId>`. */
  projectId: string;
  /** `FIREBASE_SERVICE_ACCOUNT_JSON`: needed only with `checkRevoked`. */
  serviceAccountJson?: string;
  /** Accepted so the whole of `settingsFromEnv(settings, readEnv)` can be passed; not used to verify. */
  apiKey?: string;
  authDomain?: string;
  /**
   * Also ask Firebase, on every `verify`, whether the user still exists, isn't disabled, and hasn't
   * had their sessions revoked since the token was issued. One call per request, with the service
   * account; without it a revoked token is accepted until it expires (within an hour). Default false.
   */
  checkRevoked?: boolean;
  /** Clock skew allowed on `exp`, `iat` and `auth_time`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
  /** The least time between two key fetches caused by an unknown `kid`, in ms. Default 30 000. */
  keysCooldownMs?: number;
}

/** Firebase ID token claims (the ones this package reads; the rest stay in `claims`). */
export interface FirebaseIdTokenPayload extends JWTPayload {
  auth_time?: number;
  user_id?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  /** Custom claims the app set with the Admin API; `roles` is read into `ResolvedIdentity.roles`. */
  roles?: unknown;
  firebase?: { sign_in_provider?: string; identities?: Record<string, unknown>; tenant?: string; [key: string]: unknown };
}

function invalid(reason: string): AuthError {
  return new AuthError('auth/invalid-token', `Firebase ID token refused: ${reason}`);
}

function strings(v: unknown): string[] {
  if (typeof v === 'string' && v) return [v];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
  return [];
}

/**
 * Firebase's signing keys, kept for the max-age Google answers with. An unknown `kid` (a key just
 * rotated in) fetches them again, at most once per cooldown. When a fetch fails, the keys already
 * in hand keep being used: they're still Google's, and a blip shouldn't sign everyone out.
 */
class KeyStore {
  private set?: { keys: Map<string, KeySet['keys'][number]>; expiresAt: number; fetchedAt: number };
  private readonly imported = new Map<string, ReturnType<typeof importJWK>>();
  private loading?: Promise<void>;

  constructor(
    private readonly api: FirebaseApi,
    private readonly cooldownMs: number,
  ) {}

  async key(kid: string): ReturnType<typeof importJWK> {
    if (!this.set || this.set.expiresAt <= Date.now()) await this.load(this.set !== undefined);
    if (!this.set?.keys.has(kid) && this.set && Date.now() - this.set.fetchedAt >= this.cooldownMs) await this.load(true);
    const jwk = this.set?.keys.get(kid);
    if (!jwk) throw invalid('signed with a key Firebase does not publish');
    let key = this.imported.get(kid);
    if (!key) {
      key = importJWK({ ...(jwk as JWK), alg: 'RS256' }, 'RS256');
      this.imported.set(kid, key);
    }
    return key;
  }

  private load(keepOnFailure: boolean): Promise<void> {
    this.loading ??= this.api
      .keys(null)
      .then(({ keys, maxAgeMs }) => {
        const now = Date.now();
        this.set = { keys: new Map(keys.map((k) => [k.kid, k])), expiresAt: now + maxAgeMs, fetchedAt: now };
        for (const kid of this.imported.keys()) if (!this.set.keys.has(kid)) this.imported.delete(kid);
      })
      .catch((error: unknown) => {
        if (keepOnFailure && this.set) {
          // Try again in a minute, not on every request while Google is unreachable.
          this.set.expiresAt = Date.now() + 60_000;
          return;
        }
        throw new AuthError('auth/identity-provider', "Firebase's signing keys couldn't be read", { code: (error as { code?: unknown })?.code });
      })
      .finally(() => {
        this.loading = undefined;
      });
    return this.loading;
  }
}

/**
 * Verifies Firebase ID tokens (what the browser's Firebase SDK gives `getIdToken()`), the way
 * Firebase documents for a third-party JWT library: RS256, a `kid` Firebase publishes, `aud` the
 * project id, `iss` `https://securetoken.google.com/<projectId>`, `exp` in the future, `iat` and
 * `auth_time` in the past, `sub` non-empty. No Admin SDK. Maps the token onto `ResolvedIdentity`:
 *
 * - `sub` (the Firebase uid) → `userId`; no `tenantId` (Firebase has no organizations);
 * - a `roles` custom claim → `roles`;
 * - the whole verified payload (`email`, `email_verified`, `firebase.sign_in_provider`, custom claims) → `claims`.
 */
export class FirebaseAuthProvider implements AuthProvider {
  readonly name = 'firebase';

  private readonly api: FirebaseApi;
  private readonly keys: KeyStore;
  private readonly issuer: string;
  private readonly tolerance: number;

  constructor(
    private readonly config: FirebaseAuthConfig,
    deps: FirebaseDeps = {},
  ) {
    if (!config.projectId) throw new AuthError('auth/invalid-config', 'Firebase: `projectId` (FIREBASE_PROJECT_ID) is required');
    if (config.checkRevoked && !config.serviceAccountJson) {
      throw new AuthError('auth/invalid-config', 'Firebase: `checkRevoked` needs the service account (FIREBASE_SERVICE_ACCOUNT_JSON)');
    }
    this.api = createFirebaseApi({ projectId: config.projectId, serviceAccountJson: config.checkRevoked ? config.serviceAccountJson : undefined }, deps);
    this.keys = new KeyStore(this.api, config.keysCooldownMs ?? 30_000);
    this.issuer = `https://securetoken.google.com/${config.projectId}`;
    this.tolerance = config.clockToleranceSeconds ?? 5;
  }

  async verify(token: string): Promise<ResolvedIdentity> {
    let header: { alg?: string; kid?: string };
    try {
      header = decodeProtectedHeader(token);
    } catch {
      throw invalid('not a JWT');
    }
    if (header.alg !== 'RS256') throw invalid('not signed with RS256');
    if (typeof header.kid !== 'string' || !header.kid) throw invalid('no kid in its header');
    const key = await this.keys.key(header.kid);
    let payload: FirebaseIdTokenPayload;
    try {
      ({ payload } = await jwtVerify<FirebaseIdTokenPayload>(token, key, {
        algorithms: ['RS256'],
        issuer: this.issuer,
        audience: this.config.projectId,
        clockTolerance: this.tolerance,
        requiredClaims: ['sub', 'exp', 'iat', 'auth_time'],
      }));
    } catch (error) {
      throw invalid((error as Error).message);
    }
    const now = Date.now() / 1000;
    if (typeof payload.iat !== 'number' || payload.iat > now + this.tolerance) throw invalid('"iat" is in the future');
    if (typeof payload.auth_time !== 'number' || payload.auth_time > now + this.tolerance) throw invalid('"auth_time" is in the future');
    if (typeof payload.sub !== 'string' || !payload.sub) throw invalid('no subject');
    if (this.config.checkRevoked) await this.checkRevoked(payload.sub, payload.auth_time);
    return this.toIdentity(payload);
  }

  /** Whether the user still exists, is enabled, and their sessions weren't revoked after `authTime`. */
  private async checkRevoked(uid: string, authTime: number): Promise<void> {
    let user: Awaited<ReturnType<FirebaseApi['lookup']>>;
    try {
      user = await this.api.lookup(null, { localId: uid });
    } catch (error) {
      if (error instanceof AuthError) throw error;
      throw new AuthError('auth/identity-provider', "Firebase: the user's revocation status couldn't be read", { code: (error as { code?: unknown })?.code });
    }
    if (!user) throw invalid('the user no longer exists');
    if (user.disabled) throw invalid('the user is disabled');
    if (user.validSince && authTime < Number(user.validSince)) throw invalid("the user's sessions were revoked after it was issued");
  }

  /** The mapping `verify` applies to a verified payload. */
  toIdentity(payload: FirebaseIdTokenPayload): ResolvedIdentity {
    if (typeof payload.sub !== 'string' || !payload.sub) throw invalid('no subject');
    return {
      userId: payload.sub,
      tenantId: '',
      scopes: [],
      roles: [...new Set(strings(payload.roles))],
      identityType: 'session',
      claims: { ...payload },
    };
  }

  /** Firebase sends no webhooks: its blocking functions (beforeCreate, beforeSignIn) are Cloud Functions. */
  createWebhookHandler(): AuthWebhookHandler {
    throw new AuthError('auth/not-supported', 'Firebase sends no webhooks; its blocking functions run as Cloud Functions');
  }
}
