import { NotificationError } from '@mariachi/core';
import type { EmailAdapter, EmailMessage } from '../../types';
import { addressList, parseAddress, recipients, toBase64 } from './address';
import { providerFailure } from './failure';

export interface SendGridEmailConfig {
  apiKey: string;
  from?: string;
  /** Default `https://api.sendgrid.com`. */
  apiUrl?: string;
  fetch?: typeof globalThis.fetch;
}

/** SendGrid's v3 Mail Send API, over `fetch`. */
export class SendGridEmailAdapter implements EmailAdapter {
  constructor(private readonly config: SendGridEmailConfig) {}

  async send(message: EmailMessage): Promise<{ id: string }> {
    const from = message.from ?? this.config.from;
    if (!from) throw new NotificationError('notifications/invalid-input', 'Email "from" is required');
    const to = recipients(message.to, 'SendGrid').map(parseAddress);
    const cc = addressList(message.cc).map(parseAddress);
    const bcc = addressList(message.bcc).map(parseAddress);
    // SendGrid wants text/plain before text/html.
    const content = [
      ...(message.text !== undefined || message.html === undefined ? [{ type: 'text/plain', value: message.text ?? '' }] : []),
      ...(message.html !== undefined ? [{ type: 'text/html', value: message.html }] : []),
    ];
    const body = {
      personalizations: [{ to, ...(cc.length && { cc }), ...(bcc.length && { bcc }) }],
      from: parseAddress(from),
      ...(message.replyTo && { reply_to: parseAddress(message.replyTo) }),
      subject: message.subject,
      content,
      ...(message.headers && { headers: message.headers }),
      ...(message.attachments?.length && {
        attachments: message.attachments.map((file) => ({
          filename: file.filename,
          content: toBase64(file.content),
          ...(file.contentType && { type: file.contentType }),
        })),
      }),
    };
    const send = this.config.fetch ?? ((input, init) => globalThis.fetch(input, init));
    const res = await send(`${(this.config.apiUrl ?? 'https://api.sendgrid.com').replace(/\/+$/, '')}/v3/mail/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { errors?: Array<{ message?: string }> };
      throw providerFailure('sendgrid', `SendGrid: ${data.errors?.[0]?.message ?? `responded ${res.status}`}`, { status: res.status });
    }
    // 202 with an empty body; the id is in a header. Without one, say so: a made-up id would look like SendGrid's in delivery tracking.
    return { id: res.headers.get('x-message-id') ?? `sendgrid-unknown-${crypto.randomUUID()}` };
  }
}
