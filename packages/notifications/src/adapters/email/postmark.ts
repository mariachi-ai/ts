import { NotificationError } from '@mariachi/core';
import type { EmailAdapter, EmailMessage } from '../../types';
import { addressList, recipients, toBase64 } from './address';

export interface PostmarkEmailConfig {
  /** The server token (`X-Postmark-Server-Token`). */
  apiKey: string;
  from?: string;
  /** Postmark's message stream. Default: the server's transactional stream (`outbound`). */
  messageStream?: string;
  /** Default `https://api.postmarkapp.com`. */
  apiUrl?: string;
  fetch?: typeof globalThis.fetch;
}

/** Postmark's email API, over `fetch`. */
export class PostmarkEmailAdapter implements EmailAdapter {
  constructor(private readonly config: PostmarkEmailConfig) {}

  async send(message: EmailMessage): Promise<{ id: string }> {
    const from = message.from ?? this.config.from;
    if (!from) throw new NotificationError('notifications/invalid-input', 'Email "from" is required');
    const to = recipients(message.to, 'Postmark');
    const cc = addressList(message.cc);
    const bcc = addressList(message.bcc);
    const body = {
      From: from,
      To: to.join(', '),
      ...(cc.length && { Cc: cc.join(', ') }),
      ...(bcc.length && { Bcc: bcc.join(', ') }),
      Subject: message.subject,
      ...(message.html !== undefined && { HtmlBody: message.html }),
      ...((message.text !== undefined || message.html === undefined) && { TextBody: message.text ?? '' }),
      ...(message.replyTo && { ReplyTo: message.replyTo }),
      ...(message.headers && { Headers: Object.entries(message.headers).map(([Name, Value]) => ({ Name, Value })) }),
      ...(message.attachments?.length && {
        Attachments: message.attachments.map((file) => ({
          Name: file.filename,
          Content: toBase64(file.content),
          ContentType: file.contentType ?? 'application/octet-stream',
        })),
      }),
      ...(this.config.messageStream && { MessageStream: this.config.messageStream }),
    };
    const send = this.config.fetch ?? ((input, init) => globalThis.fetch(input, init));
    const res = await send(`${(this.config.apiUrl ?? 'https://api.postmarkapp.com').replace(/\/+$/, '')}/email`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': this.config.apiKey },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { MessageID?: string; ErrorCode?: number; Message?: string };
    if (!res.ok || data.ErrorCode || !data.MessageID) {
      throw new NotificationError('notifications/provider-failed', `Postmark: ${data.Message ?? `responded ${res.status}`}`, {
        provider: 'postmark',
        status: res.status,
        errorCode: data.ErrorCode,
      });
    }
    return { id: data.MessageID };
  }
}
