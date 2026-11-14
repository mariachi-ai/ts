import { createServer, type Server } from 'node:net';
import { afterEach, describe, expect, it } from 'vitest';
import { createEmailAdapter } from '../../index';
import type { EmailMessage } from '../../types';
import { parseAddress } from './address';
import { PostmarkEmailAdapter } from './postmark';
import { SendGridEmailAdapter } from './sendgrid';
import { parseSmtpUrl, SmtpEmailAdapter, type SmtpTransport } from './smtp';

interface Seen {
  url: string;
  headers: Headers;
  body: Record<string, unknown>;
}

function recorder(reply: unknown, init: ResponseInit = { status: 200 }) {
  const seen: Seen[] = [];
  const fetch: typeof globalThis.fetch = async (input, request) => {
    seen.push({ url: String(input), headers: new Headers(request?.headers), body: JSON.parse(String(request?.body ?? '{}')) as Record<string, unknown> });
    return new Response(reply === null ? null : JSON.stringify(reply), init);
  };
  return { seen, fetch };
}

const message: EmailMessage = {
  from: 'Ada Lovelace <ada@example.com>',
  to: ['grace@example.com', 'Alan Turing <alan@example.com>'],
  cc: 'cc@example.com',
  bcc: ['bcc@example.com'],
  replyTo: 'support@example.com',
  subject: 'Hello',
  html: '<p>Hi</p>',
  text: 'Hi',
  headers: { 'X-Entity-Ref': 'order-1' },
  attachments: [{ filename: 'note.txt', content: 'hello', contentType: 'text/plain' }],
};

describe('parseAddress', () => {
  it('reads a bare address and a named one', () => {
    expect(parseAddress('ada@example.com')).toEqual({ email: 'ada@example.com' });
    expect(parseAddress('Ada Lovelace <ada@example.com>')).toEqual({ email: 'ada@example.com', name: 'Ada Lovelace' });
    expect(parseAddress('"Lovelace, Ada" <ada@example.com>')).toEqual({ email: 'ada@example.com', name: 'Lovelace, Ada' });
    expect(() => parseAddress('not an address')).toThrow(/Invalid email address/);
  });
});

describe('parseSmtpUrl', () => {
  it('requires STARTTLS when a remote URL carries credentials', () => {
    expect(parseSmtpUrl('smtp://user%40example.com:p%40ss%3Aword@smtp.example.com:587')).toEqual({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: 'user@example.com', pass: 'p@ss:word' },
    });
    expect(parseSmtpUrl('smtp://user:pass@smtp.example.com').port).toBe(587);
  });

  it('uses TLS from the start for smtps', () => {
    expect(parseSmtpUrl('smtps://user:pass@smtp.example.com')).toEqual({ host: 'smtp.example.com', port: 465, secure: true, auth: { user: 'user', pass: 'pass' } });
  });

  it('leaves a local sink and an unauthenticated relay opportunistic', () => {
    expect(parseSmtpUrl('smtp://localhost:1025')).toEqual({ host: 'localhost', port: 1025, secure: false });
    expect(parseSmtpUrl('smtp://user:pass@127.0.0.1:1025')).toEqual({ host: '127.0.0.1', port: 1025, secure: false, auth: { user: 'user', pass: 'pass' } });
    expect(parseSmtpUrl('smtp://relay.internal:25')).toEqual({ host: 'relay.internal', port: 25, secure: false });
  });

  it('takes an explicit tls mode', () => {
    expect(parseSmtpUrl('smtp://relay.internal:25?tls=required').requireTLS).toBe(true);
    expect(parseSmtpUrl('smtp://relay.internal:25?tls=none')).toMatchObject({ ignoreTLS: true });
    expect(parseSmtpUrl('smtp://user:pass@smtp.example.com?tls=required').requireTLS).toBe(true);
  });

  it('refuses to send a password to a remote host without TLS, unless told to in so many words', () => {
    for (const mode of ['none', 'opportunistic']) {
      expect(() => parseSmtpUrl(`smtp://user:pass@smtp.example.com?tls=${mode}`)).toThrow(expect.objectContaining({ code: 'notifications/invalid-smtp-url', message: expect.stringContaining('in the clear') }));
    }
    const insecure = parseSmtpUrl('smtp://user:pass@relay.internal:25?tls=none-insecure');
    expect(insecure).toMatchObject({ ignoreTLS: true, auth: { user: 'user', pass: 'pass' } });
    expect(insecure.requireTLS).toBeUndefined();
  });

  it('treats every loopback address and the Docker host as the local machine', () => {
    for (const host of ['localhost', '127.0.0.1', '127.0.0.53', '[::1]', 'host.docker.internal']) {
      expect(parseSmtpUrl(`smtp://user:pass@${host}:1025`).requireTLS, host).toBeUndefined();
      expect(parseSmtpUrl(`smtp://user:pass@${host}:1025?tls=none`).ignoreTLS, host).toBe(true);
    }
    expect(parseSmtpUrl('smtp://user:pass@127.example.com').requireTLS).toBe(true);
  });

  it('refuses anything that is not an SMTP URL', () => {
    for (const bad of ['smtp.example.com', 'https://smtp.example.com', 'smtp://user:pass@host?tls=maybe']) {
      expect(() => parseSmtpUrl(bad)).toThrow(expect.objectContaining({ code: 'notifications/invalid-smtp-url' }));
    }
  });
});

/** A tiny SMTP server that insists on AUTH PLAIN and records what it's given. */
function smtpServer() {
  const seen = { auth: [] as string[], commands: [] as string[], data: '' };
  const server: Server = createServer((socket) => {
    let inData = false;
    let authed = false;
    let buffer = '';
    socket.write('220 localhost ESMTP test\r\n');
    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      if (inData) {
        const end = buffer.indexOf('\r\n.\r\n');
        if (end === -1) return;
        seen.data = buffer.slice(0, end);
        buffer = buffer.slice(end + 5);
        inData = false;
        socket.write('250 2.0.0 queued as test-1\r\n');
      }
      let newline = buffer.indexOf('\r\n');
      while (!inData && newline !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 2);
        const verb = line.split(' ')[0].toUpperCase();
        seen.commands.push(verb);
        if (verb === 'EHLO') socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
        else if (verb === 'AUTH') {
          seen.auth.push(Buffer.from(line.split(' ')[2] ?? '', 'base64').toString('utf8'));
          authed = true;
          socket.write('235 2.7.0 ok\r\n');
        } else if (verb === 'MAIL' || verb === 'RCPT') socket.write(authed ? '250 ok\r\n' : '530 5.7.0 authentication required\r\n');
        else if (verb === 'DATA') {
          inData = true;
          socket.write('354 go ahead\r\n');
        } else if (verb === 'QUIT') socket.end('221 bye\r\n');
        else socket.write('250 ok\r\n');
        newline = buffer.indexOf('\r\n');
      }
    });
  });
  return {
    seen,
    listen: () => new Promise<number>((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port))),
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

describe('SmtpEmailAdapter', () => {
  let cleanup: Array<() => Promise<void> | void> = [];
  afterEach(async () => {
    for (const fn of cleanup) await fn();
    cleanup = [];
  });

  it('logs in and delivers through nodemailer', async () => {
    const server = smtpServer();
    const port = await server.listen();
    const adapter = new SmtpEmailAdapter({ url: `smtp://mailer:s3cret@127.0.0.1:${port}`, from: 'App <app@example.com>' });
    cleanup.push(() => adapter.close(), () => server.close());

    const result = await adapter.send({ to: 'grace@example.com', subject: 'Hello\r\nBcc: injected@example.com', text: 'Hi there' });
    expect(result.id).toMatch(/@/);
    expect(server.seen.auth).toEqual(['\0mailer\0s3cret']);
    expect(server.seen.commands.filter((c) => c === 'RCPT')).toHaveLength(1);
    expect(server.seen.data).toMatch(/^From: App <app@example\.com>$/m);
    expect(server.seen.data).toMatch(/^To: grace@example\.com$/m);
    expect(server.seen.data).toContain('Hi there');
    // A line break in the subject can't start a new header.
    expect(server.seen.data).not.toMatch(/^Bcc:/m);
  });

  it('reports a refused login as a provider failure', async () => {
    const server = createServer((socket) => {
      socket.write('220 localhost ESMTP\r\n');
      socket.on('data', (chunk) => {
        const verb = chunk.toString('utf8').split(' ')[0].trim().toUpperCase();
        if (verb === 'EHLO') socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
        else if (verb === 'AUTH') socket.write('535 5.7.8 bad credentials\r\n');
        else socket.end('221 bye\r\n');
      });
    });
    const port = await new Promise<number>((resolve) => server.listen(0, '127.0.0.1', () => resolve((server.address() as { port: number }).port)));
    const adapter = new SmtpEmailAdapter({ url: `smtp://mailer:wrong@127.0.0.1:${port}`, from: 'app@example.com' });
    cleanup.push(() => adapter.close(), () => new Promise<void>((resolve) => server.close(() => resolve())));
    // A 5xx reply is a refusal: sending again won't help.
    await expect(adapter.send({ to: 'grace@example.com', subject: 'S', text: 'T' })).rejects.toMatchObject({
      code: 'notifications/rejected',
      metadata: { provider: 'smtp', responseCode: 535, retryable: false },
    });
  });

  it('retries a temporary SMTP failure and a dropped connection', async () => {
    const failing = (error: object): SmtpTransport => ({ sendMail: async () => { throw Object.assign(new Error('nope'), error); } });
    const send = (transport: SmtpTransport) => new SmtpEmailAdapter({ from: 'app@example.com', transport }).send({ to: 'a@example.com', subject: 'S', text: 'T' });
    await expect(send(failing({ responseCode: 451 }))).rejects.toMatchObject({ code: 'notifications/provider-failed', metadata: { retryable: true, responseCode: 451 } });
    await expect(send(failing({ code: 'ECONNRESET' }))).rejects.toMatchObject({ code: 'notifications/provider-failed', metadata: { retryable: true, smtpCode: 'ECONNRESET' } });
    const noId: SmtpTransport = { sendMail: async () => ({}) };
    expect((await send(noId)).id).toMatch(/^smtp-unknown-/);
  });

  it('passes every field of the message to the transport', async () => {
    const sent: Array<Record<string, unknown>> = [];
    const transport: SmtpTransport = { sendMail: async (mail) => { sent.push(mail); return { messageId: '<id-1@example.com>' }; } };
    const adapter = new SmtpEmailAdapter({ from: 'app@example.com', transport });
    expect(await adapter.send(message)).toEqual({ id: '<id-1@example.com>' });
    expect(sent[0]).toMatchObject({
      from: 'Ada Lovelace <ada@example.com>',
      to: ['grace@example.com', 'Alan Turing <alan@example.com>'],
      cc: ['cc@example.com'],
      bcc: ['bcc@example.com'],
      replyTo: 'support@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'X-Entity-Ref': 'order-1' },
      attachments: [{ filename: 'note.txt', content: 'hello', contentType: 'text/plain' }],
    });
    await expect(adapter.send({ to: [], subject: 'S', text: 'T' })).rejects.toMatchObject({ code: 'notifications/missing-recipient' });
  });
});

describe('PostmarkEmailAdapter', () => {
  it('posts the message with the server token', async () => {
    const { seen, fetch } = recorder({ MessageID: 'pm-1', ErrorCode: 0, Message: 'OK' });
    const adapter = new PostmarkEmailAdapter({ apiKey: 'token-1', messageStream: 'outbound', fetch });
    expect(await adapter.send(message)).toEqual({ id: 'pm-1' });
    expect(seen[0].url).toBe('https://api.postmarkapp.com/email');
    expect(seen[0].headers.get('x-postmark-server-token')).toBe('token-1');
    expect(seen[0].body).toEqual({
      From: 'Ada Lovelace <ada@example.com>',
      To: 'grace@example.com, Alan Turing <alan@example.com>',
      Cc: 'cc@example.com',
      Bcc: 'bcc@example.com',
      Subject: 'Hello',
      HtmlBody: '<p>Hi</p>',
      TextBody: 'Hi',
      ReplyTo: 'support@example.com',
      Headers: [{ Name: 'X-Entity-Ref', Value: 'order-1' }],
      Attachments: [{ Name: 'note.txt', Content: 'aGVsbG8=', ContentType: 'text/plain' }],
      MessageStream: 'outbound',
    });
  });

  it("sends a message's own stream in place of the configured one", async () => {
    const { seen, fetch } = recorder({ MessageID: 'pm-2', ErrorCode: 0 });
    const adapter = new PostmarkEmailAdapter({ apiKey: 't', from: 'app@example.com', messageStream: 'outbound', fetch });
    await adapter.send({ to: 'a@example.com', subject: 'S', text: 'T', stream: 'newsletter' });
    await adapter.send({ to: 'a@example.com', subject: 'S', text: 'T' });
    expect(seen.map((request) => request.body.MessageStream)).toEqual(['newsletter', 'outbound']);
  });

  it("reports Postmark's error and needs a sender", async () => {
    const { fetch } = recorder({ ErrorCode: 300, Message: 'Invalid email request' }, { status: 422 });
    const adapter = new PostmarkEmailAdapter({ apiKey: 't', from: 'app@example.com', fetch });
    await expect(adapter.send({ to: 'a@example.com', subject: 'S', text: 'T' })).rejects.toMatchObject({
      code: 'notifications/rejected',
      message: 'Postmark: Invalid email request',
      metadata: { provider: 'postmark', status: 422, errorCode: 300, retryable: false },
    });
    for (const status of [408, 429, 500, 503]) {
      const down = recorder({ Message: 'try later' }, { status });
      await expect(new PostmarkEmailAdapter({ apiKey: 't', from: 'app@example.com', fetch: down.fetch }).send({ to: 'a@example.com', subject: 'S', text: 'T' })).rejects.toMatchObject({
        code: 'notifications/provider-failed',
        metadata: { status, retryable: true },
      });
    }
    await expect(new PostmarkEmailAdapter({ apiKey: 't', fetch }).send({ to: 'a@example.com', subject: 'S', text: 'T' })).rejects.toMatchObject({ code: 'notifications/invalid-input' });
  });
});

describe('SendGridEmailAdapter', () => {
  it('posts the message with the key as a bearer token and returns the header id', async () => {
    const { seen, fetch } = recorder(null, { status: 202, headers: { 'x-message-id': 'sg-1' } });
    const adapter = new SendGridEmailAdapter({ apiKey: 'key-1', fetch });
    expect(await adapter.send(message)).toEqual({ id: 'sg-1' });
    expect(seen[0].url).toBe('https://api.sendgrid.com/v3/mail/send');
    expect(seen[0].headers.get('authorization')).toBe('Bearer key-1');
    expect(seen[0].body).toEqual({
      personalizations: [{
        to: [{ email: 'grace@example.com' }, { email: 'alan@example.com', name: 'Alan Turing' }],
        cc: [{ email: 'cc@example.com' }],
        bcc: [{ email: 'bcc@example.com' }],
      }],
      from: { email: 'ada@example.com', name: 'Ada Lovelace' },
      reply_to: { email: 'support@example.com' },
      subject: 'Hello',
      content: [{ type: 'text/plain', value: 'Hi' }, { type: 'text/html', value: '<p>Hi</p>' }],
      headers: { 'X-Entity-Ref': 'order-1' },
      attachments: [{ filename: 'note.txt', content: 'aGVsbG8=', type: 'text/plain' }],
    });
  });

  it("reports SendGrid's error", async () => {
    const { fetch } = recorder({ errors: [{ message: 'The from address does not match a verified Sender Identity.' }] }, { status: 403 });
    await expect(new SendGridEmailAdapter({ apiKey: 'k', from: 'app@example.com', fetch }).send({ to: 'a@example.com', subject: 'S', html: '<p>x</p>' })).rejects.toMatchObject({
      code: 'notifications/rejected',
      metadata: { provider: 'sendgrid', status: 403, retryable: false },
    });
  });

  it("marks the id when SendGrid doesn't return one", async () => {
    const { fetch } = recorder(null, { status: 202 });
    const result = await new SendGridEmailAdapter({ apiKey: 'k', from: 'app@example.com', fetch }).send({ to: 'a@example.com', subject: 'S', text: 'T' });
    expect(result.id).toMatch(/^sendgrid-unknown-/);
  });
});

describe('createEmailAdapter', () => {
  it('builds each adapter from config', () => {
    expect(createEmailAdapter({ email: { adapter: 'smtp', smtpUrl: 'smtps://u:p@smtp.example.com' } })).toBeInstanceOf(SmtpEmailAdapter);
    expect(createEmailAdapter({ email: { adapter: 'smtp' } })).toBeInstanceOf(SmtpEmailAdapter);
    expect(createEmailAdapter({ email: { adapter: 'postmark', apiKey: 'k' } })).toBeInstanceOf(PostmarkEmailAdapter);
    expect(createEmailAdapter({ email: { adapter: 'sendgrid', apiKey: 'k' } })).toBeInstanceOf(SendGridEmailAdapter);
    const mine = { send: async () => ({ id: 'x' }) };
    expect(createEmailAdapter({ email: { adapter: 'custom', instance: mine } })).toBe(mine);
  });

  it('says what is missing', () => {
    expect(() => createEmailAdapter({ email: { adapter: 'smtp', smtpUrl: 'https://nope' } })).toThrow(expect.objectContaining({ code: 'notifications/invalid-smtp-url' }));
    expect(() => createEmailAdapter({ email: { adapter: 'postmark' } })).toThrow(expect.objectContaining({ code: 'notifications/missing-api-key' }));
    expect(() => createEmailAdapter({ email: { adapter: 'custom' } })).toThrow(/requires instance/);
    expect(() => createEmailAdapter({ email: { adapter: 'pigeon' } })).toThrow(expect.objectContaining({ code: 'notifications/unknown-adapter' }));
  });
});
