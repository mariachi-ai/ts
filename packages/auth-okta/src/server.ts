import { AuthError } from '@mariachi/core';

/** Where an Okta org and its custom authorization server answer, read from the issuer. */
export interface OktaServer {
  /** `https://{yourOktaDomain}/oauth2/{authorizationServerId}`, as tokens carry it in `iss`. */
  issuer: string;
  /** `https://{yourOktaDomain}`: the Management API and the org authorization server. */
  origin: string;
  /** `{yourOktaDomain}`: the `server.address` of every span. */
  host: string;
  authorizationServerId: string;
}

const LOCAL = /^(localhost|127(\.\d{1,3}){3}|\[::1\])$/;

/**
 * The org and the authorization server from `OKTA_ISSUER`. Only a custom authorization server
 * (`/oauth2/{authorizationServerId}`) is accepted: the org authorization server's access tokens are meant for
 * Okta's own APIs, and Okta says not to validate them in yours.
 */
export function oktaServer(issuer: string): OktaServer {
  let url: URL;
  try {
    url = new URL(issuer);
  } catch {
    throw new AuthError('auth/invalid-config', 'Okta: OKTA_ISSUER is not a URL');
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOCAL.test(url.hostname))) {
    throw new AuthError('auth/invalid-config', 'Okta: OKTA_ISSUER must be https://');
  }
  const match = /^\/oauth2\/([^/]+)\/?$/.exec(url.pathname);
  if (!match || url.search || url.hash) {
    throw new AuthError(
      'auth/invalid-config',
      "Okta: OKTA_ISSUER must be a custom authorization server, https://{yourOktaDomain}/oauth2/{authorizationServerId} (such as /oauth2/default). The org authorization server's access tokens are only for Okta's own APIs",
    );
  }
  return { issuer: `${url.origin}/oauth2/${match[1]}`, origin: url.origin, host: url.host, authorizationServerId: match[1]! };
}

/** The audience a server's access tokens carry: the setting, or `api://default` for the default server. */
export function oktaAudience(server: OktaServer, audience: string | undefined): string {
  if (audience) return audience;
  if (server.authorizationServerId === 'default') return 'api://default';
  throw new AuthError('auth/invalid-config', `Okta: set OKTA_AUDIENCE to the audience of authorization server "${server.authorizationServerId}"`);
}
