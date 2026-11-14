export type AsymmetricAlgorithm = 'ES256' | 'ES384' | 'ES512' | 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'EdDSA';

/** A verified token's payload. */
export type OidcClaims = Record<string, unknown>;

/** A claim's name, or a function for one that's nested or computed (`(c) => c.realm_access?.roles`). */
export type ClaimSource<T> = string | ((claims: OidcClaims) => T | undefined);

export interface OidcConfig {
  /**
   * The issuer, exactly as tokens carry it in `iss` (compare a real token: a trailing slash
   * matters). Unless `jwksUrl` is set, the signing keys are found through the issuer's discovery
   * document, `<issuer>/.well-known/openid-configuration`. It must be `https://`, as must
   * `discoveryUrl`, `jwksUrl` and the `jwks_uri` the document names: over plain HTTP, anyone on
   * the path could serve their own keys. Only the local machine may use `http://`.
   */
  issuer: string;
  /**
   * The `aud` a token must carry: your API's identifier or client id. Required, because a token
   * meant for another application of the same provider is otherwise accepted. Pass `null` only
   * for a provider whose tokens have no `aud` (Amazon Cognito access tokens); `validate` is then
   * required, to check what they have instead.
   */
  audience: string | string[] | null;
  /**
   * Require this `typ` in the token's header, e.g. `at+jwt` for access tokens that follow RFC 9068
   * (`application/at+jwt` is the same thing). Off by default, since many providers set only `JWT`.
   * Worth setting when your API's audience is also the client id, where `aud` alone can't tell an
   * access token from an `id_token`.
   */
  requireTokenType?: string;
  /** Where to read the JWKS, skipping discovery. */
  jwksUrl?: string;
  /** The discovery document, when it isn't at `<issuer>/.well-known/openid-configuration` (an internal address, say). */
  discoveryUrl?: string;
  /** Accepted signing algorithms. Default `['RS256', 'ES256']`. HMAC algorithms are refused: verify through the JWKS. */
  algorithms?: AsymmetricAlgorithm[];
  /**
   * The claim holding the tenant (organization, account, realm). Default `org_id`. A token without
   * it has no tenant. It must be a claim only the provider sets: one a user can edit (profile or
   * user metadata) would let them name any tenant.
   */
  tenantClaim?: ClaimSource<string>;
  /** Claims holding roles: a string or a list each. Default `roles`. */
  rolesClaim?: ClaimSource<string | string[]> | Array<ClaimSource<string | string[]>>;
  /** Claims holding scopes or permissions: a space-separated string or a list each. Default `scope`, `scp` and `permissions`. */
  scopesClaim?: ClaimSource<string | string[]> | Array<ClaimSource<string | string[]>>;
  /**
   * Also list every role among the scopes, so a route's `scopes` can require a role by name.
   * Default false: a role and a scope with the same name would otherwise be the same grant.
   */
  rolesAsScopes?: boolean;
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
