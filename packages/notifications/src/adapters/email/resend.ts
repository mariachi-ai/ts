import { Resend } from 'resend';
import { NotificationError } from '@mariachi/core';
import type { EmailAdapter, EmailMessage } from '../../types';
import { addressList, recipients } from './address';
import { providerFailure } from './failure';

/** Resend's error names that a later attempt can get past; every other name is a refusal. */
const RETRYABLE = new Set(['rate_limit_exceeded', 'application_error', 'internal_server_error', 'concurrent_idempotent_requests']);

export interface ResendEmailAdapterOptions {
  apiKey: string;
  from?: string;
}

export class ResendEmailAdapter implements EmailAdapter {
  private readonly resend: Resend;
  private readonly defaultFrom?: string;

  constructor(options: ResendEmailAdapterOptions) {
    this.resend = new Resend(options.apiKey);
    this.defaultFrom = options.from;
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    const from = message.from ?? this.defaultFrom;
    if (!from) {
      throw new NotificationError('notifications/invalid-input', 'Email "from" is required');
    }
    const to = recipients(message.to, 'Resend');
    const cc = addressList(message.cc);
    const bcc = addressList(message.bcc);
    const payload = {
      from,
      to,
      subject: message.subject,
      ...(cc.length && { cc }),
      ...(bcc.length && { bcc }),
      ...(message.replyTo && { replyTo: message.replyTo }),
      ...(message.headers && { headers: message.headers }),
      ...(message.attachments?.length && {
        attachments: message.attachments.map((file) => ({ filename: file.filename, content: Buffer.from(file.content), contentType: file.contentType })),
      }),
    };
    const withContent =
      message.html && message.text
        ? { ...payload, html: message.html, text: message.text }
        : message.html
          ? { ...payload, html: message.html }
          : { ...payload, text: message.text ?? '' };
    const { data, error } = await this.resend.emails.send(withContent);
    if (error) {
      throw providerFailure('resend', `Resend: ${error.message}`, { name: error.name, retryable: RETRYABLE.has(error.name) });
    }
    if (!data?.id) {
      throw new NotificationError('notifications/provider-failed', 'Resend did not return an id', { provider: 'resend' });
    }
    return { id: data.id };
  }
}
