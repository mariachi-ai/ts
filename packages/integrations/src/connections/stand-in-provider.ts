import { createHash, randomBytes } from 'node:crypto';
import { type Server, createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { IntegrationError } from '@mariachi/core';

/**
 * A local stand-in for a provider's OAuth server, for the tests: it checks what a real one checks (the client's
 * secret, the exact redirect URI, PKCE, single-use codes, single-use rotating refresh tokens) and records what it
 * was asked. It answers in-process through `fetch`, or over HTTP once `listen()`ed.
 */
export interface StandInOptions {
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  /** Seconds. Default 3600; `null` sends no `expires_in`. */
  expiresIn?: number | null;
  /** Each refresh token works once and the answer carries a new one (default), or it keeps working and none is sent. */
  rotate?: boolean;
  /** Give no refresh token at all. */
  noRefresh?: boolean;
  /** Milliseconds each token request takes, to let concurrent refreshes overlap. */
  delayMs?: number;
  /** The scope the token endpoint reports; default the one asked for. */
  scope?: string;
}

interface Grant {
  challenge?: string;
  method?: string;
  redirectUri: string;
  scope: string;
}

const token = (prefix: string) => `${prefix}_${randomBytes(18).toString('base64url')}`;

export function standInProvider(options: StandInOptions = {}) {
  const clientId = options.clientId ?? 'client-123';
  const clientSecret = options.clientSecret ?? 'secret-xyz';
  const redirectUri = options.redirectUri ?? 'https://app.example.test/connect/acme';
  const codes = new Map<string, Grant>();
  const refreshTokens = new Map<string, string>();
  const accessTokens = new Set<string>();
  const log = { tokenRequests: [] as Array<Record<string, string>>, refreshes: 0, revoked: [] as Array<{ token: string; hint?: string }>, issued: [] as string[], codes: [] as string[] };
  let base = 'https://auth.acme.test';
  let failRevoke = false;

  function issue(scope: string, previousRefresh?: string) {
    const access = token('at');
    accessTokens.add(access);
    log.issued.push(access);
    const body: Record<string, unknown> = { access_token: access, token_type: 'Bearer', scope: options.scope ?? scope };
    if (options.expiresIn !== null) body.expires_in = options.expiresIn ?? 3600;
    if (!options.noRefresh && (options.rotate !== false || !previousRefresh)) {
      const refresh = token('rt');
      refreshTokens.set(refresh, scope);
      log.issued.push(refresh);
      body.refresh_token = refresh;
    }
    return body;
  }

  async function handle(method: string, url: URL, headers: Record<string, string>, body: string): Promise<{ status: number; json?: unknown }> {
    if (method !== 'POST') return { status: 405 };
    if (options.delayMs) await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    const form = Object.fromEntries(new URLSearchParams(body));
    let id = form.client_id;
    let secret = form.client_secret;
    if (headers.authorization?.startsWith('Basic ')) {
      const [user, pass] = Buffer.from(headers.authorization.slice(6), 'base64').toString().split(':');
      id = decodeURIComponent(user ?? '');
      secret = decodeURIComponent(pass ?? '');
    }
    if (url.pathname === '/revoke') {
      if (failRevoke) return { status: 503 };
      log.revoked.push({ token: form.token ?? '', hint: form.token_type_hint });
      refreshTokens.delete(form.token ?? '');
      accessTokens.delete(form.token ?? '');
      return { status: 200 };
    }
    if (url.pathname !== '/token') return { status: 404 };
    log.tokenRequests.push(form);
    if (id !== clientId || secret !== clientSecret) return { status: 401, json: { error: 'invalid_client', error_description: `no client ${id}` } };
    if (form.grant_type === 'authorization_code') {
      const grant = codes.get(form.code ?? '');
      codes.delete(form.code ?? '');
      if (!grant) return { status: 400, json: { error: 'invalid_grant', error_description: `code ${form.code} is unknown or used` } };
      if (form.redirect_uri !== grant.redirectUri) return { status: 400, json: { error: 'invalid_grant', error_description: 'redirect_uri mismatch' } };
      if (grant.challenge) {
        const expected = createHash('sha256').update(form.code_verifier ?? '').digest('base64url');
        if (grant.method !== 'S256' || expected !== grant.challenge) return { status: 400, json: { error: 'invalid_grant', error_description: 'PKCE verification failed' } };
      }
      return { status: 200, json: { ...issue(grant.scope), account: 'acct-42' } };
    }
    if (form.grant_type === 'refresh_token') {
      const scope = refreshTokens.get(form.refresh_token ?? '');
      if (scope === undefined) return { status: 400, json: { error: 'invalid_grant', error_description: `refresh token ${form.refresh_token} is invalid` } };
      log.refreshes += 1;
      if (options.rotate !== false) refreshTokens.delete(form.refresh_token ?? '');
      return { status: 200, json: issue(scope, form.refresh_token) };
    }
    return { status: 400, json: { error: 'unsupported_grant_type' } };
  }

  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const headers = Object.fromEntries(Object.entries((init?.headers as Record<string, string>) ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
    const answer = await handle(init?.method ?? 'GET', url, headers, typeof init?.body === 'string' ? init.body : '');
    return new Response(answer.json === undefined ? null : JSON.stringify(answer.json), { status: answer.status, headers: answer.json === undefined ? {} : { 'content-type': 'application/json' } });
  }) as typeof fetch;

  let server: Server | undefined;

  return {
    clientId,
    clientSecret,
    redirectUri,
    log,
    fetch: fetchFn,
    get oauth() {
      return { authorizeUrl: `${base}/authorize`, tokenUrl: `${base}/token`, revokeUrl: `${base}/revoke`, scopes: ['contacts.read', 'contacts.write'], refresh: true };
    },
    /** The user approves at the provider: returns where the provider sends the browser back. */
    approve(authorizeUrl: string): string {
      const url = new URL(authorizeUrl);
      const q = url.searchParams;
      if (q.get('client_id') !== clientId || q.get('redirect_uri') !== redirectUri || q.get('response_type') !== 'code') {
        throw new IntegrationError('stand-in/bad-authorize', 'the authorize request is not one this provider accepts');
      }
      const code = token('code');
      log.codes.push(code);
      codes.set(code, { challenge: q.get('code_challenge') ?? undefined, method: q.get('code_challenge_method') ?? undefined, redirectUri: q.get('redirect_uri') ?? '', scope: q.get('scope') ?? '' });
      const back = new URL(redirectUri);
      back.searchParams.set('code', code);
      back.searchParams.set('state', q.get('state') ?? '');
      return back.toString();
    },
    /** Makes every refresh token the provider gave out stop working, as when the user removes the app there. */
    revokeAllAtProvider() {
      refreshTokens.clear();
      accessTokens.clear();
    },
    failRevocations(fail = true) {
      failRevoke = fail;
    },
    accepts(access: string): boolean {
      return accessTokens.has(access);
    },
    async listen(): Promise<string> {
      server = createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', async () => {
          const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : (v ?? '')]));
          const answer = await handle(req.method ?? 'GET', new URL(req.url ?? '/', base), headers, body);
          res.writeHead(answer.status, answer.json === undefined ? {} : { 'content-type': 'application/json' });
          res.end(answer.json === undefined ? undefined : JSON.stringify(answer.json));
        });
      });
      await new Promise<void>((resolve) => server!.listen(0, '127.0.0.1', resolve));
      base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      return base;
    },
    async close(): Promise<void> {
      await new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve()));
    },
  };
}

export type StandInProvider = ReturnType<typeof standInProvider>;
