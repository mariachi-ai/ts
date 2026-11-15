import { createContext } from '@mariachi/core';
import { describe, expect, it } from 'vitest';
import { invitationEmail, type InvitationDelivery } from './email';

const silent = { info() {}, warn() {}, error() {}, debug() {}, child: () => silent };
const ctx = createContext({ userId: 'ada', logger: silent });
const TOKEN = '6f0d6b0c-3a4e-4c1b-9f5e-2b7d1a9c8e10.c2VjcmV0LXNlY3JldC1zZWNyZXQtc2VjcmV0LXNlY3JldA';

function delivery(overrides: { name?: string; role?: 'owner' | 'admin' | 'member' } = {}): InvitationDelivery {
  const now = new Date('2026-11-15T12:00:00Z');
  return {
    organization: { id: '6f0d6b0c-3a4e-4c1b-9f5e-2b7d1a9c8e10', name: overrides.name ?? 'Acme Rockets', slug: 'acme-rockets', status: 'active', createdAt: now, updatedAt: now },
    invitation: {
      id: '0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41',
      organizationId: '6f0d6b0c-3a4e-4c1b-9f5e-2b7d1a9c8e10',
      email: 'ivy@example.com',
      role: overrides.role ?? 'member',
      invitedBy: 'ada',
      expiresAt: new Date('2026-11-22T12:00:00Z'),
      acceptedAt: null,
      acceptedBy: null,
      revokedAt: null,
      createdAt: now,
    },
    token: TOKEN,
  };
}

function outbox() {
  const sent: Array<{ to: string; subject: string; text?: string; html?: string; from?: string }> = [];
  return {
    sent,
    email: {
      send: async (message: (typeof sent)[number]) => {
        sent.push(message);
        return { id: 'm1' };
      },
    },
  };
}

describe('invitationEmail', () => {
  it('sends the link, with the token, to the invited address only', async () => {
    const { email, sent } = outbox();
    await invitationEmail({ email, acceptUrl: 'https://app.example.com/invitations/accept', appName: 'Launchpad' })(ctx, delivery());
    expect(sent).toHaveLength(1);
    const [message] = sent;
    expect(message?.to).toBe('ivy@example.com');
    expect(message?.subject).toBe("You're invited to join Acme Rockets on Launchpad");
    const url = `https://app.example.com/invitations/accept?token=${encodeURIComponent(TOKEN)}`;
    expect(message?.text).toContain(url);
    expect(message?.text).toContain('as a member');
    expect(message?.text).toContain('until November 22, 2026');
    expect(message?.html).toContain(`<a href="${url}">Accept the invitation</a>`);
    expect(message).not.toHaveProperty('from');
  });

  it('keeps the query the accept page already has, and says "an" before owner and admin', async () => {
    const { email, sent } = outbox();
    await invitationEmail({ email, acceptUrl: 'https://app.example.com/join?from=email', from: 'Launchpad <team@example.com>' })(ctx, delivery({ role: 'owner' }));
    expect(sent[0]?.text).toContain(`https://app.example.com/join?from=email&token=${encodeURIComponent(TOKEN)}`);
    expect(sent[0]?.text).toContain('to join Acme Rockets as an owner');
    expect(sent[0]?.from).toBe('Launchpad <team@example.com>');
  });

  it("escapes the organization's name in the HTML and keeps it on one line in the subject", async () => {
    const { email, sent } = outbox();
    await invitationEmail({ email, acceptUrl: 'https://app.example.com/a' })(ctx, delivery({ name: 'Acme\r\nBcc: eve@example.com <script>alert(1)</script>' }));
    expect(sent[0]?.subject).toBe("You're invited to join Acme Bcc: eve@example.com <script>alert(1)</script>");
    expect(sent[0]?.subject).not.toMatch(/[\r\n]/);
    expect(sent[0]?.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(sent[0]?.html).not.toContain('<script>');
  });

  it('takes a function for the link and a message of your own', async () => {
    const { email, sent } = outbox();
    const deliver = invitationEmail({
      email,
      acceptUrl: ({ organization, token }) => `https://${organization.slug}.example.com/join#token=${token}`,
      compose: (_ctx, { organization, url }) => ({ subject: `Join ${organization.name}\nnow`, text: url }),
    });
    await deliver(ctx, delivery());
    expect(sent[0]).toMatchObject({ subject: 'Join Acme Rockets now', text: `https://acme-rockets.example.com/join#token=${TOKEN}` });
    expect(sent[0]?.html).toBeUndefined();
  });

  it('refuses an address that is not a web link: at once for a fixed one, and without repeating it', async () => {
    const { email, sent } = outbox();
    expect(() => invitationEmail({ email, acceptUrl: '/invitations/accept' })).toThrowError(expect.objectContaining({ code: 'organizations/invalid-accept-url' }));
    expect(() => invitationEmail({ email, acceptUrl: 'javascript:alert(1)' })).toThrowError(expect.objectContaining({ code: 'organizations/invalid-accept-url' }));
    const deliver = invitationEmail({ email, acceptUrl: ({ token }) => `mailto:eve@example.com?body=${token}` });
    const refused = await deliver(ctx, delivery()).catch((error: Error) => error);
    expect(refused).toMatchObject({ code: 'organizations/invalid-accept-url' });
    expect((refused as Error).message).not.toContain(TOKEN);
    expect(sent).toHaveLength(0);
  });

  it('fails when the send fails, so whoever invited knows to resend', async () => {
    const deliver = invitationEmail({
      email: {
        send: async () => {
          throw new Error('provider is down'); // mariachi-lint-ignore: stands in for an adapter's failure
        },
      },
      acceptUrl: 'https://app.example.com/a',
    });
    await expect(deliver(ctx, delivery())).rejects.toThrow('provider is down');
  });
});
