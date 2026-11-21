import type { Context } from '@mariachi/core';
import { type FailureInfo, type ProviderDeps, type ProviderRequest, mappedFailure, providerRequest } from '@mariachi/integrations';
import type { z } from 'zod';
import { StytchError } from './errors';
import { type StytchOperation, errorMap, provider } from './generated';
import { StytchErrorBody } from './schemas';

export interface StytchDeps extends ProviderDeps {
  /** For tests: `scriptedFetch` from `@mariachi/integrations/testing`. */
  fetch?: typeof fetch;
}

const LIVE = 'https://api.stytch.com';
const TEST = 'https://test.stytch.com';

/**
 * The API a project id calls: `https://api.stytch.com` for a Live project (`project-live-…`), else
 * `https://test.stytch.com`. Stytch's own SDKs choose the same way.
 */
export function stytchApiBaseUrl(projectId: string): string {
  return projectId.startsWith('project-live-') ? LIVE : TEST;
}

/** The issuer of the project's session JWTs when its API is called at Stytch's own hosts. */
export function stytchIssuer(projectId: string): string {
  return `stytch.com/${projectId}`;
}

type Request = Omit<ProviderRequest, 'url' | 'headers'> & { path: string };

/**
 * One call to Stytch through `providerRequest`: the span (`stytch passwords.authenticate`), metrics, retries, the
 * answer checked against `schema`, and a failure turned into a `StytchError` with Stytch's `error_type`.
 * `base.secret`, with the project id, is sent as HTTP Basic; the JWKS call goes without it.
 */
export function stytchCall<T>(
  ctx: Context | null,
  base: { projectId: string; secret?: string; deps: StytchDeps },
  operation: StytchOperation,
  request: Request,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
): Promise<T> {
  const url = stytchApiBaseUrl(base.projectId);
  const { path, ...rest } = request;
  const headers: Record<string, string> = base.secret ? { authorization: `Basic ${Buffer.from(`${base.projectId}:${base.secret}`).toString('base64')}` } : {};
  return providerRequest(
    ctx,
    { integration: provider.id, operation, category: provider.category, server: new URL(url).host },
    { ...rest, url: `${url}${path}`, headers },
    { schema, error: StytchError, failure, deps: base.deps },
  );
}

/** Stytch's error body is `{ status_code, error_type, error_message, … }`: the type is kept, the message isn't. */
function failure(_status: number, body: unknown): FailureInfo | undefined {
  const parsed = StytchErrorBody.safeParse(body);
  const code = parsed.success ? parsed.data.error_type : undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

export function segment(value: string): string {
  return encodeURIComponent(value);
}
