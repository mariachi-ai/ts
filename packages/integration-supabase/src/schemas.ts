import { z } from 'zod';

/**
 * Supabase's shapes, as far as an app reads them. Unknown fields pass through (`passthrough`), so a field
 * Supabase adds doesn't fail the boundary; a field the app relies on that goes missing does.
 */

const Metadata = z.record(z.unknown());

/** A user as Auth's admin API returns it. `email_confirmed_at` set means the address is proven. */
export const SupabaseUser = z
  .object({
    id: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    role: z.string().optional(),
    email_confirmed_at: z.string().nullish(),
    phone_confirmed_at: z.string().nullish(),
    last_sign_in_at: z.string().nullish(),
    /** Set by the app (the secret key) only: safe to make decisions on. */
    app_metadata: Metadata.optional(),
    /** Written by the user themselves: never trust it for a decision. */
    user_metadata: Metadata.optional(),
    banned_until: z.string().nullish(),
    is_anonymous: z.boolean().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
  })
  .passthrough();
export type SupabaseUser = z.infer<typeof SupabaseUser>;

export const UserPage = z.object({ users: z.array(SupabaseUser) }).passthrough();
export type UserPage = z.infer<typeof UserPage>;

/** Auth's user ids are UUIDs: anything else never reaches a path. */
const UserId = z.string().uuid();

export const ListUsersInput = z.object({
  /** From 1. */
  page: z.number().int().min(1).optional(),
  perPage: z.number().int().min(1).optional(),
});

export const CreateUserInput = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    password: z.string().min(1).optional(),
    /** Mark the address confirmed. Only when the app itself has proven it (an invitation link it emailed). */
    emailConfirm: z.boolean().optional(),
    phoneConfirm: z.boolean().optional(),
    userMetadata: Metadata.optional(),
    appMetadata: Metadata.optional(),
  })
  .refine((i) => i.email !== undefined || i.phone !== undefined, { message: 'Give an email or a phone number', path: ['email'] });
export type CreateUserInput = z.input<typeof CreateUserInput>;

export const InviteUserInput = z.object({
  email: z.string().email(),
  /** Goes into the new user's `user_metadata`. */
  data: Metadata.optional(),
  /** Where the invitation's link lands after it signs the user in. Must be in Auth's allowed redirect URLs. */
  redirectTo: z.string().url().optional(),
});
export type InviteUserInput = z.input<typeof InviteUserInput>;

export const DeleteUserInput = z.object({
  userId: UserId,
  /** Keep the row, marked deleted, instead of removing the account. */
  softDelete: z.boolean().optional(),
});
export type DeleteUserInput = z.input<typeof DeleteUserInput>;

export const GetUserInput = UserId;

export const InvokeInput = z.object({
  /** The function's name, as deployed. */
  name: z.string().min(1),
  /** Sent as JSON. */
  body: z.unknown().optional(),
  /**
   * A signed-in user's access token: the function runs for them, under Row Level Security, and needs the
   * publishable key set. Without it the call is the app's own, with the secret key.
   */
  accessToken: z.string().min(1).optional(),
  /**
   * Retry when Supabase is rate limiting or unavailable. Off by default: a function that failed with a 5xx may
   * have done its work, so only turn it on for one that is safe to run twice.
   */
  safeToRetry: z.boolean().optional(),
});
export type InvokeInput = z.input<typeof InvokeInput>;

/** The user an Auth Hook is about. */
const HookUser = z
  .object({
    id: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
    new_email: z.string().optional(),
    app_metadata: Metadata.optional(),
    user_metadata: Metadata.optional(),
    is_anonymous: z.boolean().optional(),
  })
  .passthrough();

/**
 * The Send Email hook's body: Supabase Auth wants this email sent, with this token in it.
 *
 * With Secure Email Change on, an `email_change` carries two tokens. The hash fields are named the other way
 * round, for backward compatibility: `token` and `token_hash_new` are for the current address (`user.email`),
 * `token_new` and `token_hash` for the new one (`user.new_email`).
 */
export const SendEmailHookBody = z
  .object({
    user: HookUser,
    email_data: z
      .object({
        token: z.string(),
        token_hash: z.string(),
        redirect_to: z.string(),
        /** `signup`, `invite`, `magiclink`, `recovery`, `email_change`, `email`, `reauthentication`, or a `…_notification`. */
        email_action_type: z.string(),
        site_url: z.string(),
        token_new: z.string(),
        token_hash_new: z.string(),
      })
      .passthrough(),
  })
  .passthrough();
export type SendEmailHookBody = z.infer<typeof SendEmailHookBody>;

/** The Send SMS hook's body: send `sms.otp`, a six-digit code, to `user.phone`. */
export const SendSmsHookBody = z
  .object({
    user: HookUser,
    sms: z.object({ otp: z.string().regex(/^[0-9]{6}$/) }).passthrough(),
  })
  .passthrough();
export type SendSmsHookBody = z.infer<typeof SendSmsHookBody>;
