import { AuthError, loadOptionalPeer } from '@mariachi/core';
import { type ProviderDeps, callProvider } from '@mariachi/integrations';
import type { z } from 'zod';
import { CognitoError } from './errors';
import { type CognitoOperation, operations, provider } from './generated';
import { codeInfo, idpHost } from './shared';

const SDK = '@aws-sdk/client-cognito-identity-provider';

/** What the admin calls need of `@aws-sdk/client-cognito-identity-provider`'s client: `send` a command. */
export interface CognitoAdminClient {
  send(command: unknown): Promise<unknown>;
}

/** The admin API's commands this package sends, by their SDK names. */
type Command = 'AdminGetUserCommand' | 'ListUsersCommand' | 'AdminCreateUserCommand' | 'AdminSetUserPasswordCommand' | 'AdminDeleteUserCommand';
type Sdk = Record<Command, new (input: object) => unknown> & {
  CognitoIdentityProviderClient: new (config: object) => CognitoAdminClient;
};

export interface AdminConfig {
  region: string;
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
}

/**
 * The user pool's admin API (AdminGetUser, ListUsers, ...), which AWS SigV4 signs: the AWS SDK does the signing, loaded
 * on first use, and each call goes through `callProvider` (span `cognito users.get`), which owns the retries (the SDK's
 * own are off). Credentials are the two settings when given, else the SDK's default chain.
 */
export function cognitoAdmin(config: AdminConfig, deps: ProviderDeps & { adminClient?: CognitoAdminClient }) {
  const server = idpHost(config.region);
  if (Boolean(config.awsAccessKeyId) !== Boolean(config.awsSecretAccessKey)) {
    throw new AuthError('auth/invalid-config', 'Cognito: set both COGNITO_AWS_ACCESS_KEY_ID and COGNITO_AWS_SECRET_ACCESS_KEY, or neither (the default credential chain)');
  }
  let client = deps.adminClient;
  let sdk: Sdk | undefined;

  function load(): { sdk: Sdk; client: CognitoAdminClient } {
    sdk ??= loadOptionalPeer<Sdk>(SDK, 'The Cognito admin calls (users)', import.meta.url);
    client ??= new sdk.CognitoIdentityProviderClient({
      region: config.region,
      maxAttempts: 1,
      ...(config.awsAccessKeyId && config.awsSecretAccessKey ? { credentials: { accessKeyId: config.awsAccessKeyId, secretAccessKey: config.awsSecretAccessKey } } : {}),
    });
    return { sdk, client };
  }

  return async function send<T>(operation: CognitoOperation, command: Command, input: object, schema: z.ZodType<T, z.ZodTypeDef, unknown>): Promise<T> {
    const loaded = load();
    // A call Cognito can't recognise as a repeat (AdminCreateUser) isn't retried after a failure it may have acted on:
    // a lost reply would make the retry fail with UsernameExistsException. Rate limits still are.
    const callDeps = operations[operation].idempotency === 'none' ? { ...deps, retry: { ...deps.retry, unsafe: true } } : deps;
    return callProvider(
      null,
      { integration: provider.id, operation, category: provider.category, server, method: 'POST' },
      async (attempt) => {
        let output: unknown;
        try {
          output = await loaded.client.send(new loaded.sdk[command](input));
        } catch (error) {
          const e = error as { name?: string; $metadata?: { httpStatusCode?: number } };
          const status = e?.$metadata?.httpStatusCode;
          if (status === undefined) {
            // No answer at all: Cognito couldn't be reached (or credentials couldn't be found, which isn't retried)
            if (e?.name === 'CredentialsProviderError') throw new CognitoError(`${provider.id}/no-credentials`, 'No AWS credentials for the Cognito admin calls', { category: 'unauthorized' });
            throw new CognitoError(`${provider.id}/unavailable`, `${provider.id} couldn't be reached`, { category: 'unavailable' });
          }
          attempt.setStatusCode(status);
          const info = codeInfo(e.name);
          const category = info.category ?? (status >= 500 ? 'unavailable' : 'invalid-request');
          throw new CognitoError(`${provider.id}/${info.reason ?? category}`, `${provider.id} ${operation} failed (${status})`, { category, providerCode: info.providerCode, status });
        }
        attempt.setStatusCode((output as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode ?? 200);
        const parsed = schema.safeParse(output);
        if (!parsed.success) {
          throw new CognitoError(`${provider.id}/invalid-response`, `${provider.id} ${operation} answered in an unexpected shape`, { category: 'unavailable', details: { issues: parsed.error.issues.map((i) => ({ path: i.path.join('.'), code: i.code })) } });
        }
        return parsed.data;
      },
      callDeps,
    );
  };
}
