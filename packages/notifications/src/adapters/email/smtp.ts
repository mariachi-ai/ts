import { NotificationError } from '@mariachi/core';
import type { EmailAdapter, EmailMessage } from '../../types';
import { addressList, recipients } from './address';
import { providerFailure } from './failure';

/** The part of a nodemailer transport this adapter uses. */
export interface SmtpTransport {
  sendMail(mail: Record<string, unknown>): Promise<{ messageId?: string }>;
  close?(): void;
}

export interface SmtpEmailConfig {
  /**
   * `smtp://user:pass@host:587` or `smtps://user:pass@host:465`. Percent-encode special characters
   * in the user and password. `smtps` is TLS from the first byte. `smtp` upgrades with STARTTLS:
   * required when the URL has credentials (unless the host is the local machine), otherwise used
   * when the server offers it. `?tls=required`, `?tls=opportunistic` or `?tls=none` overrides that,
   * except that a URL with credentials for a remote host must use TLS: `opportunistic` and `none`
   * are refused there, because either can send the password in the clear. `?tls=none-insecure`
   * is the one way to do that on purpose (a relay on a private network, say).
   */
  url?: string;
  /** Used with `port` when there's no `url`: a local sink such as Mailpit. Default `127.0.0.1`. */
  host?: string;
  /** Default 1025 with `host`. A `url` without a port uses 587 (`smtp`) or 465 (`smtps`). */
  port?: number;
  /** The default sender, when a message has no `from`. */
  from: string;
  /** A ready transport, in place of one built from `url` or `host` (tests, a custom nodemailer setup). */
  transport?: SmtpTransport;
}

export interface SmtpOptions {
  host: string;
  port: number;
  secure: boolean;
  requireTLS?: boolean;
  ignoreTLS?: boolean;
  auth?: { user: string; pass: string };
}

/** The local machine: loopback names and addresses, and Docker's name for the host. */
function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '::1' || hostname === '[::1]' || hostname === 'host.docker.internal' || /^127(\.\d{1,3}){3}$/.test(hostname);
}

/** What nodemailer's transport is built with, from an SMTP URL (see `SmtpEmailConfig.url`). */
export function parseSmtpUrl(value: string): SmtpOptions {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new NotificationError('notifications/invalid-smtp-url', 'SMTP URL is not a URL (expected smtp://user:pass@host:port)');
  }
  if (url.protocol !== 'smtp:' && url.protocol !== 'smtps:') {
    throw new NotificationError('notifications/invalid-smtp-url', `SMTP URL must start with smtp:// or smtps://, not ${url.protocol}//`);
  }
  if (!url.hostname) throw new NotificationError('notifications/invalid-smtp-url', 'SMTP URL has no host');
  const secure = url.protocol === 'smtps:';
  const options: SmtpOptions = { host: url.hostname, port: url.port ? Number(url.port) : secure ? 465 : 587, secure };
  if (url.username) options.auth = { user: decodeURIComponent(url.username), pass: decodeURIComponent(url.password) };

  const exposed = Boolean(options.auth) && !isLocalHost(url.hostname);
  const tls = url.searchParams.get('tls') ?? (exposed ? 'required' : 'opportunistic');
  if (tls !== 'required' && tls !== 'opportunistic' && tls !== 'none' && tls !== 'none-insecure') {
    throw new NotificationError('notifications/invalid-smtp-url', `SMTP URL has tls=${tls}; use required, opportunistic, none or none-insecure`);
  }
  if (!secure) {
    if (exposed && (tls === 'opportunistic' || tls === 'none')) {
      throw new NotificationError(
        'notifications/invalid-smtp-url',
        `SMTP URL has credentials for ${url.hostname} with tls=${tls}, which can send the password in the clear; use tls=required (the default), smtps://, or tls=none-insecure to accept that`,
      );
    }
    if (tls === 'required') options.requireTLS = true;
    if (tls === 'none' || tls === 'none-insecure') options.ignoreTLS = true;
  }
  return options;
}

type CreateTransport = (options: SmtpOptions) => SmtpTransport;

async function loadCreateTransport(): Promise<CreateTransport> {
  try {
    const mod = (await import('nodemailer')) as unknown as { createTransport?: CreateTransport; default?: { createTransport: CreateTransport } };
    const create = mod.createTransport ?? mod.default?.createTransport;
    if (!create) throw new NotificationError('notifications/provider-failed', 'nodemailer has no createTransport export', { provider: 'smtp' });
    return create;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException | undefined)?.code;
    if (code === 'ERR_MODULE_NOT_FOUND' || code === 'MODULE_NOT_FOUND') {
      throw new NotificationError('dependency/missing-peer', 'SmtpEmailAdapter requires the optional peer dependency "nodemailer". Install it with: pnpm add nodemailer', {
        pkg: 'nodemailer',
        feature: 'SmtpEmailAdapter',
      });
    }
    throw error;
  }
}

/**
 * Email over SMTP through nodemailer (an optional peer dependency, imported on the first send):
 * any SMTP relay with a username and password over TLS, or a local sink such as Mailpit.
 */
export class SmtpEmailAdapter implements EmailAdapter {
  private readonly options: SmtpOptions;
  private transport?: Promise<SmtpTransport>;

  constructor(private readonly config: SmtpEmailConfig) {
    this.options = config.url ? parseSmtpUrl(config.url) : { host: config.host ?? '127.0.0.1', port: config.port ?? 1025, secure: false };
    if (config.transport) this.transport = Promise.resolve(config.transport);
  }

  private connection(): Promise<SmtpTransport> {
    this.transport ??= loadCreateTransport().then((create) => create(this.options));
    this.transport.catch(() => {
      this.transport = undefined;
    });
    return this.transport;
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    const to = recipients(message.to, 'SMTP');
    const transport = await this.connection();
    try {
      const info = await transport.sendMail({
        from: message.from ?? this.config.from,
        to,
        cc: addressList(message.cc),
        bcc: addressList(message.bcc),
        replyTo: message.replyTo,
        subject: message.subject,
        html: message.html,
        text: message.text ?? (message.html ? undefined : ''),
        headers: message.headers,
        attachments: message.attachments?.map((file) => ({ filename: file.filename, content: file.content, contentType: file.contentType })),
      });
      return { id: info.messageId ?? `smtp-unknown-${crypto.randomUUID()}` };
    } catch (error) {
      const detail = error as { message?: string; code?: string; responseCode?: number };
      throw providerFailure('smtp', `SMTP: ${detail.message ?? 'send failed'}`, { smtpCode: detail.code, responseCode: detail.responseCode });
    }
  }

  /** Closes the pooled connection, if one was opened. */
  async close(): Promise<void> {
    const transport = await this.transport?.catch(() => undefined);
    transport?.close?.();
    this.transport = undefined;
  }
}
