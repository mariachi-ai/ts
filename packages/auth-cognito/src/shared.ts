import { AuthError, MariachiError } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, mappedFailure } from '@mariachi/integrations';
import { CognitoError } from './errors';
import { errorMap, provider } from './generated';

export interface CognitoDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

/** The user pool's API host, which also serves its keys: `cognito-idp.us-east-1.amazonaws.com`. */
export function idpHost(region: string): string {
  if (!/^[a-z]{2}(-[a-z]+)+-\d+$/.test(region)) throw new AuthError('auth/invalid-config', 'Cognito: `region` should look like us-east-1');
  return `cognito-idp.${region}.amazonaws.com`;
}

/** The pool's issuer, `https://cognito-idp.<region>.amazonaws.com/<userPoolId>`, checked against every token's `iss`. */
export function issuerOf(region: string, userPoolId: string): string {
  if (!/^[\w-]+_[0-9a-zA-Z]+$/.test(userPoolId)) throw new AuthError('auth/invalid-config', 'Cognito: `userPoolId` should look like us-east-1_EXAMPLE');
  return `https://${idpHost(region)}/${userPoolId}`;
}

/** The managed login domain as an origin: `auth.example.com` and `https://auth.example.com/` both give `https://auth.example.com`. */
export function domainOrigin(domain: string): string {
  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(domain) ? domain : `https://${domain}`);
  } catch {
    throw new AuthError('auth/invalid-config', 'Cognito: `domain` is not a host name');
  }
  if (url.protocol !== 'https:') throw new AuthError('auth/invalid-config', 'Cognito: `domain` must be https');
  return url.origin;
}

/**
 * Cognito's error code, kept; its message isn't (it can echo input). The JSON API answers `{ "__type": "NotAuthorizedException" }`
 * (sometimes prefixed with a namespace and `#`), the OAuth endpoints `{ "error": "invalid_grant" }`.
 */
export function failure(_status: number, body: unknown): FailureInfo | undefined {
  const b = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
  const raw = typeof b.__type === 'string' ? b.__type : typeof b.error === 'string' ? b.error : undefined;
  return codeInfo(raw);
}

export function codeInfo(raw: string | undefined): FailureInfo {
  const code = raw?.split('#').pop() || undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** Cognito's codes that mean the person got their email or password wrong, or has no account. */
const REFUSED_SIGN_IN = new Set(['NotAuthorizedException', 'UserNotFoundException', 'PasswordResetRequiredException']);

/**
 * A failed call as the auth port's `AuthError` (a bad input stays a `ValidationError`): `auth/rate-limited`, the refusal the caller names (a wrong password, a
 * spent code), or `auth/identity-provider` for anything that means Cognito or its configuration is at fault. The
 * category, Cognito's code and the status go in the metadata, never Cognito's message.
 */
export function toAuthError(error: unknown, refused: 'auth/invalid-credentials' | 'auth/invalid-grant'): MariachiError {
  if (error instanceof AuthError) return error;
  if (!(error instanceof CognitoError)) {
    const code = (error as { code?: unknown })?.code;
    if (code === 'dependency/missing-peer') return new AuthError('auth/invalid-config', (error as Error).message);
    if (error instanceof MariachiError && typeof code === 'string' && code.startsWith('validation/')) return error;
    return new AuthError('auth/identity-provider', `${provider.name} request failed`);
  }
  const meta = { category: error.category, providerCode: error.providerCode, status: error.status };
  if (error.category === 'rate-limited') return new AuthError('auth/rate-limited', `${provider.name} rate limit reached`, meta);
  const code = error.providerCode ?? '';
  if (refused === 'auth/invalid-credentials' && REFUSED_SIGN_IN.has(code)) return new AuthError(refused, 'Invalid email or password', meta);
  if (code === 'invalid_grant' || (refused === 'auth/invalid-grant' && code === 'NotAuthorizedException')) {
    return new AuthError('auth/invalid-grant', `${provider.name} refused the code or token`, meta);
  }
  if (error.category === 'conflict' || (error.category === 'invalid-request' && code !== 'InvalidParameterException' && code !== 'invalid_request')) {
    return new AuthError(refused, `${provider.name} refused the request (${code || error.status})`, meta);
  }
  return new AuthError('auth/identity-provider', `${provider.name} request failed (${code || error.category})`, meta);
}
