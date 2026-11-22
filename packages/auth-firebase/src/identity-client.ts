import type {
  CreateIdentityUserInput,
  EmailCodeInput,
  EmailDelivery,
  IdentityClient,
  IdentityRequestContext,
  IdentityUser,
  PasswordSignInInput,
  SignInResult,
  SignOutInput,
  TokenSet,
} from '@mariachi/auth';
import { AuthError, type Context, ValidationError } from '@mariachi/core';
import { decodeJwt } from 'jose';
import { type FirebaseApi, type FirebaseDeps, createFirebaseApi } from './api';
import { FirebaseError } from './errors';
import type { FirebaseConfig } from './generated';
import type { SignInResponse, UserInfo } from './schemas';

export interface FirebaseIdentityClientConfig extends FirebaseConfig {
  /**
   * Who sends password-reset and sign-in-link emails: `provider` (the default: Firebase, with the
   * templates in Authentication › Templates) or `app` (Firebase sends nothing and these calls return
   * the code and link for the app to email; needs the service account).
   */
  emailsSentBy?: 'app' | 'provider';
  /**
   * The app's page a sign-in link opens (`startEmailCode`), with `oobCode` in its query; that page
   * calls `signInWithEmailCode`. Its domain must be in Authentication › Settings › Authorized domains,
   * and Email link sign-in must be on. Without it, `startEmailCode` is not supported.
   */
  emailLinkUrl?: string;
}

type Refused = 'auth/invalid-credentials' | 'auth/invalid-grant';

/** What the port's codes mean for each of Firebase's categories. */
function authError(error: unknown, refused: Refused): Error {
  if (error instanceof AuthError || error instanceof ValidationError) return error;
  if (error instanceof FirebaseError) {
    const meta = { code: error.code, category: error.category, providerCode: error.providerCode, status: error.status };
    if (error.category === 'rate-limited') return new AuthError('auth/rate-limited', 'Firebase: too many attempts, try again later', meta);
    if (['invalid-request', 'not-found', 'forbidden', 'conflict'].includes(error.category)) {
      return new AuthError(refused, `Firebase refused the request (${error.providerCode ?? error.status})`, meta);
    }
    return new AuthError('auth/identity-provider', `Firebase request failed (${error.code})`, meta);
  }
  return new AuthError('auth/identity-provider', 'Firebase request failed');
}

/** The user in a sign-in's answer, with what only its ID token says (`email_verified`). */
function signedInUser(res: SignInResponse): IdentityUser {
  let claims: Record<string, unknown> = {};
  try {
    // Read, not verified: the token is Firebase's own reply over TLS. `FirebaseAuthProvider.verify` checks every token a client sends.
    if (res.idToken) claims = decodeJwt(res.idToken);
  } catch {
    // No claims to read; email_verified stays false.
  }
  const text = (v: unknown) => (typeof v === 'string' && v ? v : null);
  return {
    id: res.localId,
    email: res.email ?? text(claims.email) ?? '',
    emailVerified: claims.email_verified === true,
    name: text(res.displayName) ?? text(claims.name),
    avatarUrl: text(res.profilePicture) ?? text(claims.picture),
    externalId: null,
  };
}

function toUser(u: UserInfo): IdentityUser {
  return { id: u.localId, email: u.email ?? '', emailVerified: u.emailVerified === true, name: u.displayName || null, avatarUrl: u.photoUrl || null, externalId: null };
}

function expiresAt(seconds: string | undefined): number | undefined {
  const n = Number(seconds);
  return seconds && Number.isFinite(n) ? Date.now() + n * 1000 : undefined;
}

function signInResult(res: SignInResponse): SignInResult {
  if (res.mfaPendingCredential) {
    // Finished with Identity Platform's MFA sign-in (accounts/mfaSignIn:finalize), which this client doesn't make.
    return { status: 'pending', reason: 'mfa', pendingToken: res.mfaPendingCredential, ...(res.email ? { email: res.email } : {}) };
  }
  if (!res.idToken || !res.refreshToken) throw new AuthError('auth/identity-provider', 'Firebase signed the user in without tokens');
  return { status: 'signed-in', user: signedInUser(res), tokens: { accessToken: res.idToken, refreshToken: res.refreshToken, expiresAt: expiresAt(res.expiresIn) } };
}

/**
 * `IdentityClient` on Firebase Authentication's REST APIs, for an app with its own sign-in pages.
 * Sign-in, refresh and Firebase-sent emails use the web API key; user management uses the service
 * account (a Google OAuth token signed with its key, no Admin SDK). The auth port's methods carry no
 * `ctx`, so their spans have no tenant.
 *
 * Not supported, failing with `auth/not-supported`:
 * - `authorizationUrl` and `exchangeCode`: Google and GitHub sign-in happen in the browser, through
 *   Firebase's client SDK (`signInWithPopup`, `signInWithRedirect`). Send its ID token to the API
 *   and verify it with `FirebaseAuthProvider`.
 * - `pendingVerificationCode` and `verifyEmailAndSignIn`: Firebase never holds a sign-in for an
 *   unverified email. Read `user.emailVerified` and decide in the app.
 */
export class FirebaseIdentityClient implements IdentityClient {
  readonly provider = 'firebase';

  private readonly api: FirebaseApi;

  constructor(
    private readonly config: FirebaseIdentityClientConfig,
    deps: FirebaseDeps = {},
  ) {
    if (!config.apiKey) throw new AuthError('auth/invalid-config', 'Firebase: `apiKey` (FIREBASE_API_KEY) is required');
    if (!config.projectId) throw new AuthError('auth/invalid-config', 'Firebase: `projectId` (FIREBASE_PROJECT_ID) is required');
    if (config.emailsSentBy === 'app' && !config.serviceAccountJson) {
      throw new AuthError('auth/invalid-config', "Firebase: `emailsSentBy: 'app'` needs the service account (FIREBASE_SERVICE_ACCOUNT_JSON)");
    }
    this.api = createFirebaseApi(config, deps);
  }

  private get appSendsEmails(): boolean {
    return this.config.emailsSentBy === 'app';
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<SignInResult> {
    try {
      return signInResult(await this.api.signInWithPassword(null, input));
    } catch (error) {
      throw authError(error, 'auth/invalid-credentials');
    }
  }

  authorizationUrl(): string {
    throw new AuthError('auth/not-supported', "Firebase's Google and GitHub sign-in runs in the browser through its client SDK; verify the ID token it gives with FirebaseAuthProvider");
  }

  async exchangeCode(): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', "Firebase's Google and GitHub sign-in runs in the browser through its client SDK; verify the ID token it gives with FirebaseAuthProvider");
  }

  async refresh(refreshToken: string, _context?: IdentityRequestContext): Promise<TokenSet> {
    try {
      const res = await this.api.refresh(null, refreshToken);
      return { accessToken: res.id_token, refreshToken: res.refresh_token, expiresAt: expiresAt(res.expires_in) };
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  /**
   * Does nothing at Firebase: it can't end one session, so the app drops the tokens. To end every
   * session of a user (a lost device, a changed password), call `revokeSessions`.
   */
  async signOut(_input: SignOutInput): Promise<void> {}

  /**
   * Revokes every refresh token issued to the user before now, with the service account. ID tokens
   * already issued stay valid until they expire (within an hour) unless `FirebaseAuthProvider` runs
   * with `checkRevoked`.
   */
  async revokeSessions(ctx: Context, userId: string): Promise<void> {
    try {
      await this.api.updateUser(ctx, { localId: userId, validSince: String(Math.floor(Date.now() / 1000)) });
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async getUser(id: string): Promise<IdentityUser | null> {
    try {
      const user = await this.api.lookup(null, { localId: id });
      return user ? toUser(user) : null;
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async findUserByEmail(email: string): Promise<IdentityUser | null> {
    try {
      const user = await this.api.lookup(null, { email });
      return user ? toUser(user) : null;
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  /**
   * With the service account, an admin create (the email can be marked verified). Without it, the
   * self sign-up Firebase's client SDK makes, which needs a password and leaves the email unverified.
   * Firebase stores no id of the app's own, so `externalId` is refused: keep that mapping in the app.
   */
  async createUser(input: CreateIdentityUserInput): Promise<IdentityUser> {
    if (input.externalId !== undefined) throw new AuthError('auth/not-supported', 'Firebase stores no external id; keep the mapping in the app');
    try {
      if (this.api.hasServiceAccount) {
        const res = await this.api.createUser(null, { email: input.email, emailVerified: input.emailVerified, password: input.password, displayName: input.name });
        return { id: res.localId, email: res.email ?? input.email, emailVerified: input.emailVerified, name: res.displayName ?? input.name ?? null, avatarUrl: null, externalId: null };
      }
      if (input.emailVerified || !input.password) {
        throw new AuthError('auth/invalid-config', 'Firebase: creating a user with a verified email, or without a password, needs the service account (FIREBASE_SERVICE_ACCOUNT_JSON)');
      }
      return signedInUser(await this.api.signUp(null, { email: input.email, password: input.password, displayName: input.name }));
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.api.deleteUser(null, id);
    } catch (error) {
      if (error instanceof FirebaseError && error.providerCode === 'USER_NOT_FOUND') return;
      throw authError(error, 'auth/invalid-grant');
    }
  }

  /**
   * Firebase emails the reset link, or (`emailsSentBy: 'app'`) returns its `oobCode` as the token
   * and the link to email. With email enumeration protection (on for projects made since
   * 2023-09-15) Firebase answers the same for an unknown address, so this says `provider` for it too.
   */
  async sendPasswordReset(email: string): Promise<EmailDelivery<{ token: string; url?: string; expiresAt?: number }>> {
    try {
      if (this.appSendsEmails) {
        const res = await this.api.oobLink(null, { requestType: 'PASSWORD_RESET', email });
        if (!res.oobCode) throw new AuthError('auth/identity-provider', 'Firebase returned no reset code');
        return { deliveredBy: 'app', token: res.oobCode, ...(res.oobLink ? { url: res.oobLink } : {}) };
      }
      await this.api.sendOobCode(null, { requestType: 'PASSWORD_RESET', email });
      return { deliveredBy: 'provider' };
    } catch (error) {
      if (error instanceof FirebaseError && error.providerCode === 'EMAIL_NOT_FOUND') return { deliveredBy: 'nobody' };
      throw authError(error, 'auth/invalid-grant');
    }
  }

  /** Sets the password with the reset's `oobCode`; the user is looked up with the service account, or by signing in with the new password. */
  async resetPassword(input: { token: string; password: string }): Promise<IdentityUser> {
    try {
      const { email } = await this.api.resetPassword(null, { oobCode: input.token, newPassword: input.password });
      if (!email) throw new AuthError('auth/identity-provider', 'Firebase reset the password without naming the account');
      if (this.api.hasServiceAccount) {
        const user = await this.api.lookup(null, { email });
        if (!user) throw new AuthError('auth/identity-provider', 'Firebase reset the password of an account it then could not find');
        return toUser(user);
      }
      return signedInUser(await this.api.signInWithPassword(null, { email, password: input.password }));
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async setPassword(userId: string, password: string): Promise<void> {
    try {
      await this.api.updateUser(null, { localId: userId, password });
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  /**
   * Firebase's email link sign-in: the link opens `emailLinkUrl` with an `oobCode`, which is the
   * code for `signInWithEmailCode`. It's long, so the app's own email (`emailsSentBy: 'app'`) puts it
   * in a link to that page rather than asking the user to type it. Firebase creates the user on
   * sign-in when none has the address.
   */
  async startEmailCode(email: string, _context?: IdentityRequestContext): Promise<EmailDelivery<{ code: string; expiresAt?: number }>> {
    const continueUrl = this.config.emailLinkUrl;
    if (!continueUrl) throw new AuthError('auth/not-supported', 'Firebase: set `emailLinkUrl` (the page a sign-in link opens) to sign in by email');
    try {
      if (this.appSendsEmails) {
        const res = await this.api.oobLink(null, { requestType: 'EMAIL_SIGNIN', email, continueUrl, canHandleCodeInApp: true });
        if (!res.oobCode) throw new AuthError('auth/identity-provider', 'Firebase returned no sign-in code');
        return { deliveredBy: 'app', code: res.oobCode };
      }
      await this.api.sendOobCode(null, { requestType: 'EMAIL_SIGNIN', email, continueUrl, canHandleCodeInApp: true });
      return { deliveredBy: 'provider' };
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async signInWithEmailCode(input: EmailCodeInput): Promise<SignInResult> {
    try {
      return signInResult(await this.api.signInWithEmailLink(null, { email: input.email, oobCode: input.code }));
    } catch (error) {
      throw authError(error, 'auth/invalid-grant');
    }
  }

  async pendingVerificationCode(): Promise<string> {
    throw new AuthError('auth/not-supported', 'Firebase never holds a sign-in for email verification; read user.emailVerified instead');
  }

  async verifyEmailAndSignIn(): Promise<SignInResult> {
    throw new AuthError('auth/not-supported', 'Firebase never holds a sign-in for email verification; read user.emailVerified instead');
  }
}
