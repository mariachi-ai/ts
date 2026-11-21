import { ProviderError } from '@mariachi/integrations';

/**
 * An Auth0 call that failed, as `callProvider` sees it. Codes are `auth0/<reason>`. `Auth0IdentityClient` turns it
 * into the auth port's `AuthError` (`auth/invalid-grant`, `auth/rate-limited`, …), so apps rarely meet it.
 */
export class Auth0Error extends ProviderError {
  override name = 'Auth0Error';
}
