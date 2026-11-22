import { auth0Host } from './domain';

export interface Auth0LogoutInput {
  /** Where Auth0 sends the browser afterwards. It must be listed in the application's Allowed Logout URLs. */
  returnTo?: string;
  /** The ID token from the sign-in, so Auth0 knows whose session to end without asking. */
  idTokenHint?: string;
  /** Echoed back to `returnTo`. */
  state?: string;
  /** Also sign out of the social or enterprise identity provider the user came through. */
  federated?: boolean;
}

/**
 * Where to send the browser to end its Auth0 session (OpenID Connect RP-initiated logout, `/oidc/logout`). Revoking
 * the refresh token (`signOut`) ends the app's access; this ends the single sign-on session Universal Login keeps in
 * Auth0's own cookie, so the next sign-in asks again.
 */
export function auth0LogoutUrl(config: { domain: string; clientId: string }, input: Auth0LogoutInput = {}): string {
  const url = new URL(`https://${auth0Host(config.domain)}/oidc/logout`);
  url.searchParams.set('client_id', config.clientId);
  if (input.returnTo) url.searchParams.set('post_logout_redirect_uri', input.returnTo);
  if (input.idTokenHint) url.searchParams.set('id_token_hint', input.idTokenHint);
  if (input.state) url.searchParams.set('state', input.state);
  if (input.federated) url.searchParams.set('federated', '');
  return url.toString();
}
