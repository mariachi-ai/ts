import { ProviderError } from '@mariachi/integrations';

/**
 * A Supabase call that failed. Codes are `supabase/<reason>`; `category` says what to do (only `rate-limited`
 * and `unavailable` are worth retrying, and the client already did). Auth's own code (`email_exists`) is in
 * `providerCode`; its message is never kept, since it can echo the input.
 */
export class SupabaseError extends ProviderError {
  override name = 'SupabaseError';
}
