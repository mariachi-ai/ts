export interface FusionAuthConfig {
  /** FusionAuth server base URL (e.g. https://your-tenant.fusionauth.io) */
  serverUrl: string;
  /** Application client ID used as JWT audience (aud) */
  clientId: string;
  /**
   * The `iss` every token must carry: the tenant's Issuer setting in FusionAuth (its default is
   * `acme.com`, not the server URL). Not checked unless set, so set it.
   */
  issuer?: string;
}
