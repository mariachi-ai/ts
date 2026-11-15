import { ConfigError, type Context } from '@mariachi/core';
import type { Invitation, Organization } from './types';

/** What `deliverInvitation` is handed: the invitation, its organization and the secret for the link. */
export interface InvitationDelivery {
  organization: Organization;
  invitation: Invitation;
  /** The invitation's secret. It exists only here: send it to the invited address and nowhere else. */
  token: string;
}

/** The part of an email adapter this uses. `EmailAdapter` from `@mariachi/notifications` fits as is. */
export interface InvitationMailer {
  send(message: { to: string; subject: string; text?: string; html?: string; from?: string }): Promise<unknown>;
}

export interface InvitationMessage {
  subject: string;
  text?: string;
  html?: string;
}

export interface InvitationEmailOptions {
  /** What sends the message: an email adapter from `@mariachi/notifications`, or anything with the same `send`. */
  email: InvitationMailer;
  /**
   * The page of your app that accepts an invitation. The token is added as `?token=`. That page signs
   * the user in, then calls `POST /organizations/invitations/accept` with `{ token }` as them. Give a
   * function to build the whole link yourself (it must return an `http:` or `https:` URL).
   */
  acceptUrl: string | ((delivery: InvitationDelivery) => string);
  /** Your product's name, for the subject and the first line. */
  appName?: string;
  /** The sender, when it isn't the adapter's own. */
  from?: string;
  /** Write the message yourself. `url` is the finished link. Values you put in HTML are yours to escape. */
  compose?: (ctx: Context, message: InvitationDelivery & { url: string }) => InvitationMessage | Promise<InvitationMessage>;
}

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]!);
/** One line, no control characters: an organization's name is written by a user and goes into a mail header. */
const oneLine = (value: string): string => value.replace(/\p{Cc}+/gu, ' ').trim();
const longDate = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' });
const ROLE_PHRASE: Record<string, string> = { owner: 'an owner', admin: 'an admin', member: 'a member' };

function checked(url: string): string {
  let parsed: URL | undefined;
  try {
    parsed = new URL(url);
  } catch {
    parsed = undefined;
  }
  if (!parsed || (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')) {
    // The link itself is not in the message: it may carry the token
    throw new ConfigError('organizations/invalid-accept-url', 'invitationEmail: acceptUrl must be an http: or https: URL');
  }
  return parsed.href;
}

function link(acceptUrl: InvitationEmailOptions['acceptUrl'], delivery: InvitationDelivery): string {
  if (typeof acceptUrl === 'function') return checked(acceptUrl(delivery));
  const url = new URL(checked(acceptUrl));
  url.searchParams.set('token', delivery.token);
  return url.href;
}

function defaultMessage(options: InvitationEmailOptions, delivery: InvitationDelivery, url: string): InvitationMessage {
  const organization = oneLine(delivery.organization.name);
  const app = options.appName ? oneLine(options.appName) : undefined;
  const where = app ? `${organization} on ${app}` : organization;
  const role = ROLE_PHRASE[delivery.invitation.role] ?? delivery.invitation.role;
  const until = longDate.format(delivery.invitation.expiresAt);
  const fine = `The link works once, for ${delivery.invitation.email}, until ${until}. If you weren't expecting it, you can ignore this email.`;
  return {
    subject: `You're invited to join ${where}`,
    text: `You've been invited to join ${where} as ${role}.\n\nAccept the invitation:\n${url}\n\n${fine}\n`,
    html: [
      `<p>You've been invited to join <strong>${escapeHtml(organization)}</strong>${app ? ` on ${escapeHtml(app)}` : ''} as ${escapeHtml(role)}.</p>`,
      `<p><a href="${escapeHtml(url)}">Accept the invitation</a></p>`,
      `<p>Or open this link: ${escapeHtml(url)}</p>`,
      `<p>${escapeHtml(fine)}</p>`,
    ].join('\n'),
  };
}

/**
 * Sends each invitation to the address it is for. Give the result to `registerOrganizationProcedures`
 * as `deliverInvitation`:
 *
 * ```ts
 * registerOrganizationProcedures(communication, organizations, {
 *   deliverInvitation: invitationEmail({ email: createEmailAdapter(config), acceptUrl: 'https://app.example.com/invitations/accept' }),
 * });
 * ```
 *
 * The message is sent in the request that invites, straight through the adapter. It does not go
 * through a job queue or a notification record, because either would keep the token, and the token
 * is the invitation. If the send fails, so does the call; the invitation exists and can be resent.
 */
export function invitationEmail(options: InvitationEmailOptions): (ctx: Context, delivery: InvitationDelivery) => Promise<void> {
  // A fixed address that can't work is found when the app starts, not on the first invitation
  if (typeof options.acceptUrl === 'string') checked(options.acceptUrl);
  return async (ctx, delivery) => {
    const url = link(options.acceptUrl, delivery);
    const message = options.compose ? await options.compose(ctx, { ...delivery, url }) : defaultMessage(options, delivery, url);
    await options.email.send({
      to: delivery.invitation.email,
      subject: oneLine(message.subject),
      text: message.text,
      html: message.html,
      ...(options.from ? { from: options.from } : {}),
    });
  };
}
