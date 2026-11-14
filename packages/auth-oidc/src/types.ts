export type AsymmetricAlgorithm = 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'EdDSA';

/** A verified token's payload. */
export type OidcClaims = Record<string, unknown>;

/** A claim's name, or a function for one that's nested or computed (`(c) => c.realm_access?.roles`). */
export type ClaimSource<T> = string | ((claims: OidcClaims) => T | undefined);

export interface OidcConfig {
  /**
   * The issuer, exactly as tokens carry it in `iss` (compare a real token: a trailing slash
   * matters). Unless `jwksUrl` is set, the signing keys are found through the issuer's discovery
   * document, `<issuer>/.well-known/openid-configuration`.
   */
  issuer: string;
  /**
   * The `aud` a token must carry: your API's identifier or client id. Required, because a token
   * meant for another application of the same provider is otherwise accepted. Pass `null` only
   * for a provider whose tokens have no `aud` (Amazon Cognito access tokens), and check what
   * they have instead in `validate`.
   */
  audience: string | string[] | null;
  /** Where to read the JWKS, skipping discovery. */
  jwksUrl?: string;
  /** The discovery document, when it isn't at `<issuer>/.well-known/openid-configuration` (an internal address, say). */
  discoveryUrl?: string;
  /** Accepted signing algorithms. Default `['RS256', 'ES256']`. HMAC algorithms are refused: verify through the JWKS. */
  algorithms?: AsymmetricAlgorithm[];
  /** The claim holding the tenant (organization, account, realm). Default `org_id`. A token without it has no tenant. */
  tenantClaim?: ClaimSource<string>;
  /** Claims holding roles: a string or a list each. Default `roles`. */
  rolesClaim?: ClaimSource<string | string[]> | Array<ClaimSource<string | string[]>>;
  /**
   * Claims holding scopes or permissions: a space-separated string or a list each. Default `scope`,
   * `scp` and `permissions`. Roles are scopes too, so a route can require one by name.
   */
  scopesClaim?: ClaimSource<string | string[]> | Array<ClaimSource<string | string[]>>;
  /** The claim holding the session id. Default `sid`. */
  sessionClaim?: ClaimSource<string>;
  /**
   * A last check on the verified payload: throw to refuse the token. For what the standard claims
   * don't cover, such as Cognito's `token_use`, an `azp` allow-list, or a required `email_verified`.
   */
  validate?: (claims: OidcClaims) => void | Promise<void>;
  /** How long fetched keys and the discovery document are trusted, in ms. Default 60 000. */
  jwksCacheMaxAgeMs?: number;
  /** The least time between two key fetches caused by an unknown `kid`, in ms. Default 5 000. */
  jwksCooldownMs?: number;
  /** Clock skew allowed on `exp`, `nbf` and `iat`, in seconds. Default 5. */
  clockToleranceSeconds?: number;
}
