export { createSupabase, type Supabase, type SupabaseDeps } from './client';
export { SupabaseError } from './errors';
export { supabaseAuthHookAuth, supabaseAuthHookType } from './webhooks';
export { supabaseAuthConfig, supabaseDatabaseConfig, supabaseStorageConfig, type SupabaseDatabaseConfig, type SupabaseStorageConfig } from './ports';
export { keyHeaders } from './keys';
export { provider, settings, configSchema, envNames, operations, webhookEvents, type SupabaseConfig, type SupabaseOperation } from './generated';
export { SendEmailHookBody, SendSmsHookBody } from './schemas';
export type { CreateUserInput, DeleteUserInput, InviteUserInput, InvokeInput, SupabaseUser, UserPage } from './schemas';
