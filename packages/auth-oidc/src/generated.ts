// Generated from contract.json by `pnpm integrations:generate`. Do not edit: change the contract.

import type { SettingDescriptor } from '@mariachi/integrations';
import { z } from 'zod';

/** OpenID Connect: who the integration calls. `id` and `category` name its spans. */
export const provider = {
  id: 'oidc',
  name: 'OpenID Connect',
  category: 'auth',
  server: '{issuer}',
  docs: 'https://openid.net/specs/openid-connect-discovery-1_0.html',
} as const;

/** What the app sets to connect it, with where to find each value and its checks per environment. */
export const settings: readonly SettingDescriptor[] = [
  {
    key: 'issuer',
    env: 'OIDC_ISSUER',
    label: 'Issuer',
    meaning: 'The issuer exactly as tokens carry it in iss, trailing slash included. Its discovery document is at <issuer>/.well-known/openid-configuration. https:// only, except on the local machine.',
    secret: false,
    required: true,
    whereToFind: "The provider's OpenID Connect settings (the Issuer or Authority URL), or the iss claim of one of its tokens. Test and live are usually separate issuers (another tenant, realm or pool).",
    url: 'https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata',
    public: true,
  },
  {
    key: 'audience',
    env: 'OIDC_AUDIENCE',
    label: 'Audience',
    meaning: "The aud a token must carry: the API's identifier, or the client id when access tokens are issued to it.",
    secret: false,
    required: true,
    whereToFind: "The API (resource server) registered at the provider: its identifier or Application ID URI; or the application's client id.",
    url: 'https://openid.net/specs/openid-connect-core-1_0.html#IDToken',
    public: true,
  },
  {
    key: 'jwksUrl',
    env: 'OIDC_JWKS_URL',
    label: 'JWKS URL',
    meaning: 'Where the signing keys are, to skip discovery. https:// only, except on the local machine.',
    secret: false,
    required: false,
    whereToFind: "The jwks_uri in the issuer's discovery document.",
    url: 'https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderMetadata',
    public: true,
  },
  {
    key: 'discoveryUrl',
    env: 'OIDC_DISCOVERY_URL',
    label: 'Discovery URL',
    meaning: "The discovery document, when it isn't at <issuer>/.well-known/openid-configuration (an internal address, say). It must still name the configured issuer.",
    secret: false,
    required: false,
    whereToFind: 'Usually not needed. Otherwise the address the document is served at inside your network.',
    url: 'https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig',
    public: true,
  },
];

/** The config `createOidc` takes, keyed by each setting's `key`. */
export const configSchema = z.object({
  issuer: z.string().min(1),
  audience: z.string().min(1),
  jwksUrl: z.string().min(1).optional(),
  discoveryUrl: z.string().min(1).optional(),
});
export type OidcConfig = z.infer<typeof configSchema>;

/** How each setting's value is read from the environment: `settingsFromEnv(settings, readEnv)`. */
export const envNames = {
  issuer: 'OIDC_ISSUER',
  audience: 'OIDC_AUDIENCE',
  jwksUrl: 'OIDC_JWKS_URL',
  discoveryUrl: 'OIDC_DISCOVERY_URL',
} as const;

export const credentials = {
  kind: 'app',
} as const;

/** The operations, by name: the span name is `<provider> <operation>`. */
export const operations = {
  'discovery.get': {
    purpose: "Reads the issuer's discovery document, for its jwks_uri. Skipped when jwksUrl is set.",
    method: 'GET',
    path: '/.well-known/openid-configuration',
    idempotency: 'natural',
  },
  'jwks.get': {
    purpose: "Reads the issuer's signing keys from its jwks_uri: when none are cached, when the cache expires, and when a token names a key not yet seen (at most once per cooldown).",
    method: 'GET',
    idempotency: 'natural',
  },
} as const;
export type OidcOperation = keyof typeof operations;

/** The provider's error codes, to a category and the reason in `<provider>/<reason>`. */
export const errorMap: Readonly<Record<string, { category: 'unauthorized' | 'forbidden' | 'not-found' | 'invalid-request' | 'conflict' | 'rate-limited' | 'unavailable'; reason: string }>> = {};
