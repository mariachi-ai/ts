import { resolve } from 'node:path';
import type { Command } from 'commander';
import { JWTAdapter } from '@mariachi/auth';
import { ConfigError } from '@mariachi/core';
import { envFiles, projectEnv } from '../env-files';
import { fail } from '../output';

export interface TokenOptions {
  user: string;
  /** The tenant the token names, or false for none (`--no-tenant`). */
  tenant: string | false;
  email?: string;
  role: string[];
  scope: string[];
  expires: string;
}

/**
 * Signs a token the project's API accepts, with the project's own `JWT_SECRET` (and `JWT_ISSUER` and
 * `JWT_AUDIENCE` when set): what `JWTAdapter` in its `src/app.ts` verifies. For development only:
 * it is refused when the environment says production.
 */
export async function signDevToken(env: Record<string, string | undefined>, options: TokenOptions): Promise<string> {
  if (env.NODE_ENV === 'production') {
    throw new ConfigError('cli/token-in-production', 'mariachi token signs a token for any identity, for development. NODE_ENV is production here: it does nothing');
  }
  if (!env.JWT_SECRET) {
    throw new ConfigError('cli/jwt-secret-missing', 'JWT_SECRET is not set (in .env or the environment). mariachi token signs with it, for a project whose API verifies HS256 tokens (mariachi init, the default --auth jwt)');
  }
  const adapter = new JWTAdapter({ secret: env.JWT_SECRET, issuer: env.JWT_ISSUER || undefined, audience: env.JWT_AUDIENCE || undefined });
  // An address given here is one you vouch for: the token says it is verified
  const claims = options.email ? { email: options.email, email_verified: true } : undefined;
  return adapter.sign(
    { userId: options.user, tenantId: options.tenant || '', scopes: options.scope, ...(options.role.length ? { roles: options.role } : {}) },
    options.expires,
    claims,
  );
}

const collect = (value: string, previous: string[]) => [...previous, value];

export function registerTokenCommand(program: Command): void {
  program
    .command('token [path]')
    .description("Sign a development token the project's API accepts (HS256, with the project's JWT_SECRET), to call it as any user")
    .option('-u, --user <id>', 'the user the token is for', 'dev-user')
    .option('-t, --tenant <id>', 'the tenant it names', 'dev-tenant')
    .option('--no-tenant', 'name no tenant: a user in no organization')
    .option('--email <address>', 'add the email address, marked verified')
    .option('--role <role>', 'a role (repeatable)', collect, [])
    .option('--scope <scope>', 'a scope (repeatable)', collect, [])
    .option('--expires <time>', 'how long it is good for: 15m, 1h, 7d', '1h')
    .option('--env-file <file>', "an env file the app starts with (repeatable, later wins); default: package.json's mariachi.envFiles, else .env", collect, [])
    .action(async (path: string | undefined, opts: TokenOptions & { envFile: string[] }) => {
      try {
        const cwd = resolve(path ?? '.');
        const token = await signDevToken(projectEnv(cwd, envFiles(cwd, opts.envFile).files), opts);
        // The token alone on stdout, so $(mariachi token) is the token; who it is for goes to stderr
        console.log(token);
        console.error(`${opts.user}${opts.tenant ? ` in ${opts.tenant}` : ', no tenant'}${opts.email ? `, ${opts.email}` : ''}: good for ${opts.expires}`);
      } catch (error) {
        fail(error);
      }
    });
}
