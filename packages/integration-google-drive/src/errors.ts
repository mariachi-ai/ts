import { type FailureInfo, ProviderError, categoryForStatus, mappedFailure, parseRetryAfter } from '@mariachi/integrations';
import { errorMap, provider } from './generated';

/**
 * A Google Drive call that failed. Codes are `google-drive/<reason>` (`google-drive/storage-quota-exceeded`);
 * `category` says what to do (only `rate-limited` and `unavailable` are worth retrying, and the client already
 * did). Drive's own reason (`insufficientFilePermissions`) is in `providerCode`; its message is never kept.
 */
export class GoogleDriveError extends ProviderError {
  override name = 'GoogleDriveError';
}

/**
 * Reads Google's error body. Drive answers `{ error: { code, message, errors: [{ reason }] } }`, and a 403 can be
 * a rate limit (`rateLimitExceeded`, `userRateLimitExceeded`), so the reason decides, not the status. The token
 * endpoint answers `{ error: "invalid_grant", error_description }`. The code is kept, the message never is.
 */
export function failure(_status: number, body: unknown): FailureInfo | undefined {
  const error = (body as { error?: unknown } | null)?.error;
  const code =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error !== null
        ? ((error as { errors?: Array<{ reason?: unknown }> }).errors?.find((e) => typeof e?.reason === 'string')?.reason as string | undefined)
        : undefined;
  if (!code) return undefined;
  const mapped = mappedFailure(errorMap, code);
  return { providerCode: code, ...(mapped ? { category: mapped.category, reason: mapped.reason } : {}) };
}

/** The error for a failed answer the client read itself (a download, an upload), as `providerRequest` makes it. */
export async function failedResponse(response: Response, operation: string): Promise<GoogleDriveError> {
  const text = await response.text().catch(() => '');
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // not JSON: the status decides
  }
  const info = failure(response.status, body) ?? {};
  const category = info.category ?? categoryForStatus(response.status);
  return new GoogleDriveError(`${provider.id}/${info.reason ?? category}`, `${provider.id} ${operation} failed (${response.status})`, {
    category,
    providerCode: info.providerCode,
    status: response.status,
    retryAfterMs: parseRetryAfter(response.headers.get('retry-after')),
  });
}
