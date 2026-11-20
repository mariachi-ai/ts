import type { ProjectAuth } from '../types';
import { ACCEPT_INVITATION_PATH } from './invitations';
import { MAILBOX_SMTP_URL, MAILBOX_URL } from './local-auth';

/**
 * What `mariachi init --orgs` adds to a project: organizations, memberships and invitations in the
 * app's own database (`@mariachi/organizations`). The pieces here are put into the project's files by
 * `project.ts` and `gotrue.ts`, so both sign-in choices get the same wiring.
 */

/** Framework packages the organizations wiring uses. */
export const ORGANIZATION_DEPS = ['notifications', 'organizations', 'rate-limit'] as const;

export const ORGANIZATIONS_FILE = 'src/organizations.ts';
export const ORGANIZATIONS_SCHEMA_FILE = 'src/schema/organizations.ts';
export const ORGANIZATIONS_E2E_FILE = 'src/organizations.e2e.test.ts';

export const ORGANIZATIONS_SCHEMA = `/**
 * The tables behind organizations (@mariachi/organizations). An organization is a row of \`tenants\`,
 * so its id is the tenantId every tenant-scoped table already uses.
 */
export { tenantsTable } from '@mariachi/database/schema';
export { organizationInvitationsTable, organizationMembershipsTable } from '@mariachi/organizations/schema';
/** The counts behind the limits on creating organizations, inviting and accepting (see src/app.ts). */
export { rateLimitBucketsTable } from '@mariachi/rate-limit/schema';
`;

/** `src/organizations.ts`: the one place the app builds its organizations. */
export const ORGANIZATIONS_TS = `import type { InstrumentationDeps } from '@mariachi/core';
import type { CommunicationLayer } from '@mariachi/communication';
import type { DrizzleDb } from '@mariachi/database-postgres';
import {
  createOrganizationAccess,
  DefaultOrganizations,
  invitationEmail,
  registerOrganizationProcedures,
  type InvitationMailer,
  type OrganizationAccess,
  type OrganizationLimiter,
  type OrganizationsConfig,
} from '@mariachi/organizations';
import { DrizzleOrganizationStore } from '@mariachi/organizations/postgres';

export interface OrganizationsDeps {
  db: DrizzleDb;
  communication: CommunicationLayer;
  instrumentation: InstrumentationDeps;
  /** Creating organizations, inviting and accepting are limited with it. */
  limiter: OrganizationLimiter;
  /** Sends invitation emails: an email adapter from @mariachi/notifications. */
  mailer?: InvitationMailer;
  /** The page of your app that accepts an invitation (INVITATION_URL). The token is added as its fragment, #token=. */
  invitationUrl?: string;
  /** Your product's name, for the invitation email. */
  appName: string;
  /** Where a signed-in user's verified email address is read. Default: the token's email and email_verified claims. */
  verifiedEmail?: OrganizationsConfig['verifiedEmail'];
}

/**
 * Organizations, memberships and invitations, kept in this app's own database (the tables in
 * src/schema/organizations.ts). Read node_modules/@mariachi/core/docs/organizations.md before changing it.
 *
 * - \`organizations\` is the service: \`organizations.listMine(ctx)\`, \`organizations.invite(ctx, id, …)\`.
 *   Each method decides for itself whether the caller may do what is asked, from their membership.
 * - The organizations.* procedures are registered here, and OrganizationsController
 *   (src/api/controllers/index.ts) serves them under /api/organizations.
 * - \`access\` is the request check app.ts wraps sign-in with: a request names its organization in the
 *   x-organization-id header, and it becomes ctx.tenantId only once the user's membership is confirmed.
 *
 * An invitation is emailed when there is both something to send it with (EMAIL_ADAPTER) and a page
 * to send people to (INVITATION_URL). Otherwise whoever invites gets the token back in the response
 * and passes the link on themselves.
 */
export function setupOrganizations(deps: OrganizationsDeps): { organizations: DefaultOrganizations; access: OrganizationAccess } {
  const organizations = new DefaultOrganizations({ store: new DrizzleOrganizationStore(deps.db), verifiedEmail: deps.verifiedEmail }, deps.instrumentation);
  const deliverInvitation =
    deps.mailer && deps.invitationUrl ? invitationEmail({ email: deps.mailer, acceptUrl: deps.invitationUrl, appName: deps.appName }) : undefined;
  registerOrganizationProcedures(deps.communication, organizations, { limiter: deps.limiter, deliverInvitation });
  return { organizations, access: createOrganizationAccess({ organizations }) };
}
`;

/** `src/config.ts` for a JWT project: the GoTrue project has its own, with these settings added. */
export const JWT_ORGANIZATIONS_CONFIG_TS = `import { registerConfigSection } from '@mariachi/config';
import { z } from 'zod';

/** This app's own settings, read from the environment by \`@mariachi/config\` (\`useConfigSection(APP_CONFIG)\`). */
export const APP_CONFIG = 'app';

const optional = (v: string | undefined) => (v ? v : undefined);

const appSchema = z.object({
  /** The page that accepts an invitation (\`INVITATION_URL\`). Invitations are emailed only when this and \`EMAIL_ADAPTER\` are set. */
  invitationUrl: z.string().url().optional(),
});

export type AppSettings = z.infer<typeof appSchema>;

registerConfigSection(APP_CONFIG, {
  schema: appSchema,
  fromEnv: (read) => ({ invitationUrl: optional(read('INVITATION_URL')) }),
});
`;

/**
 * Lines for `.env.example`. A GoTrue project sends its email to the local mailbox in its Compose
 * file, and with `ui` it has a page that accepts invitations, which `INVITATION_URL` defaults to.
 */
export const organizationsEnv = (auth: ProjectAuth, ui = false): string => `
# Organizations (src/organizations.ts). An invitation is emailed when both of these are set; until
# then whoever invites gets the token back in the response.
#   INVITATION_URL  the page of your app that accepts an invitation; the token is added as its fragment, #token=
${
  auth === 'gotrue' && ui
    ? `#                   Default: ${ACCEPT_INVITATION_PATH} on APP_ORIGIN, or on http://localhost:<PORT> in development
`
    : ''
}#   EMAIL_ADAPTER   resend, postmark, sendgrid (with EMAIL_API_KEY) or smtp (with SMTP_URL${auth === 'gotrue' ? '' : '; pnpm add nodemailer'})
${auth === 'gotrue' && ui ? '# INVITATION_URL=' : '# INVITATION_URL=https://app.example.com/invitations/accept'}
${
  auth === 'gotrue'
    ? `# As written, email goes to the local mailbox (Mailpit, in docker-compose.yml): read it at ${MAILBOX_URL}
EMAIL_ADAPTER=smtp
SMTP_URL=${MAILBOX_SMTP_URL}
EMAIL_FROM=no-reply@example.com
# EMAIL_API_KEY=
# Accepting an invitation needs to know the user's email address is verified. GoTrue's token doesn't
# say so anywhere the user can't rewrite. Choose one:
#   AUTH_SERVICE_KEY            a service-role key (a secret, never sent to a browser): the app reads
#                               the user's record. A GoTrue that confirms sign-ups without sending mail
#                               (GOTRUE_MAILER_AUTOCONFIRM) then counts as unverified. For the local
#                               GoTrue, mariachi init wrote one into .env, signed with GOTRUE_JWT_KEYS
#                               (mariachi dev writes one when it is empty); for a hosted GoTrue, use its own.
#   AUTH_EMAIL_VERIFIED_CLAIM   set to "required" when an access token hook of yours always adds a
#                               top-level email_verified claim: no key and no lookup, and a token
#                               without the claim is refused.
AUTH_SERVICE_KEY=
# AUTH_EMAIL_VERIFIED_CLAIM=optional
`
    : `# EMAIL_ADAPTER=
# EMAIL_API_KEY=
# EMAIL_FROM=
# Accepting an invitation reads the user's address from their token: put \`email\` and
# \`email_verified: true\` in the tokens you issue, once you have confirmed the address.
`
}# Creating organizations, inviting and accepting are rate limited. The counts are kept in the database
# (the rate_limit_buckets table), so every process shares them; with REDIS_URL set, in Redis
# (pnpm add ioredis). RATE_LIMIT_ADAPTER chooses for itself: postgres, redis (needs REDIS_URL) or
# memory (each process counts apart: one process only).
# RATE_LIMIT_ADAPTER=postgres
`;

/** Imports `app.ts` gains. */
export const organizationsAppImports = (auth: ProjectAuth): string =>
  [
    "import { createEmailAdapter } from '@mariachi/notifications';",
    "import type { DefaultOrganizations, InvitationMailer } from '@mariachi/organizations';",
    "import { organizationStrategy } from '@mariachi/organizations/http';",
    "import { createRateLimiter } from '@mariachi/rate-limit';",
    ...(auth === 'gotrue' ? [] : ["import { useConfigSection } from '@mariachi/config';", "import { APP_CONFIG, type AppSettings } from './config';"]),
    "import { setupOrganizations } from './organizations';",
    '',
  ].join('\n');

/** A field of `AppOptions`. */
export const ORGANIZATIONS_APP_OPTION = `  /** Sends invitation emails in place of the adapter EMAIL_ADAPTER names. Tests pass one that keeps what it is given. */
  mailer?: InvitationMailer;
`;

/** A field of `App`. */
export const ORGANIZATIONS_APP_FIELD = `  organizations: DefaultOrganizations;
`;

/** The statements of `createApp()` that build the organizations, after the services are registered. */
export const organizationsAppSetup = (auth: ProjectAuth): string => `
  // Organizations, memberships and invitations, in this app's own database: see src/organizations.ts.
  // Creating, inviting and accepting are rate limited. The counts are kept in this database (the
  // rate_limit_buckets table, src/schema/organizations.ts), so every process that serves the API shares
  // them. With REDIS_URL set (and ioredis installed) they are kept in Redis. RATE_LIMIT_ADAPTER chooses
  // for itself: postgres, redis or memory (one process only).
  const rateLimitAdapter = config.rateLimit?.adapter ?? (config.redis ? 'redis' : 'postgres');
  if (rateLimitAdapter === 'redis' && !config.redis) {
    throw new ConfigError('app/rate-limit-redis-url-required', 'RATE_LIMIT_ADAPTER=redis needs REDIS_URL');
  }
  const limiter = lifecycle.manage(
    'rate-limit',
    createRateLimiter({ adapter: rateLimitAdapter, url: config.redis?.url, db: database.db, prefix: \`\${config.serviceName}:rate-limit\` }),
    { priority: 20 },
  );
  const { organizations, access } = setupOrganizations({
    db: database.db,
    communication,
    instrumentation,
    limiter,
    mailer: options.mailer ?? (config.email ? createEmailAdapter({ email: config.email }) : undefined),
    invitationUrl: app.invitationUrl,
    appName: config.serviceName,${
      auth === 'gotrue'
        ? `
    // GoTrue's token says "verified" only where the user can rewrite it, so the answer is read from a
    // claim your own hook adds, or from the user's record (AUTH_SERVICE_KEY)
    verifiedEmail: goTrueVerifiedEmail({
      url: goTrueConfig(app.auth).url,
      serviceKey: app.auth.serviceKey,
      requireClaim: app.auth.emailVerifiedClaim === 'required',
    }),`
        : ''
    }
  });
${
  auth === 'gotrue'
    ? `  if (!app.auth.serviceKey && app.auth.emailVerifiedClaim !== 'required') {
    logger.warn(
      { settings: ['AUTH_SERVICE_KEY', 'AUTH_EMAIL_VERIFIED_CLAIM'] },
      'Neither AUTH_SERVICE_KEY nor AUTH_EMAIL_VERIFIED_CLAIM=required is set: an invitation can be accepted only with a token that carries a top-level email_verified claim (see README.md)',
    );
  }
`
    : ''
}`;

/** The comment above the session strategy once it checks the organization a request names. */
export const ORGANIZATIONS_STRATEGY_COMMENT = `    // A request names its organization in the x-organization-id header; it becomes the tenant only once
    // the signed-in user's membership is confirmed. A request that names none stays in the identity's own tenant.
`;

/** A section for AGENTS.md. */
export const organizationsAgents = (auth: ProjectAuth): string => `
## Organizations

- Users share workspaces through \`@mariachi/organizations\` (\`src/organizations.ts\`): organizations,
  memberships and invitations in this app's database. Read
  \`node_modules/@mariachi/core/docs/organizations.md\` before changing any of it.
- **An organization is a tenant.** A request names one in the \`x-organization-id\` header, and it
  becomes \`ctx.tenantId\` only after the user's membership is checked; the member's role (\`owner\`,
  \`admin\`, \`member\`) is then among \`ctx.identity.roles\`. A request that names none runs in ${
    auth === 'gotrue' ? "the user's personal tenant" : 'no tenant, and tenant-scoped routes refuse it'
  }. Never take the organization from the request body, and never trust a role that came with the token.
- The routes are under \`/api/organizations\` (\`OrganizationsController\`); they call the
  \`organizations.*\` procedures. From your own services use the \`organizations\` object \`createApp()\`
  returns. Write through it, never with SQL: the last-owner rule and the membership cache live there.
- Creating, inviting and accepting are rate limited (\`limiter\` in \`src/app.ts\`). The counts are in
  this app's database (\`rate_limit_buckets\`, exported from \`src/schema/organizations.ts\`), shared by
  every process; with \`REDIS_URL\` set they are in Redis. \`RATE_LIMIT_ADAPTER\` overrides the choice.
  Keep the table in the schema while the limiter uses Postgres.
- In an end-to-end test, \`{ as: { userId, tenantId: 'acme' } }\` is a member of an organization the
  test calls \`acme\`: the harness creates it, and the membership, the first time they are named
  (the first user named is its owner). \`tenantId: ''\` is a user in no organization.
`;

/** What the README says about invitations in development, where a GoTrue project has a mailbox and, with pages, an accept page. */
const localInvitations = (auth: ProjectAuth, ui: boolean): string => {
  if (auth !== 'gotrue') {
    return ui
      ? ` \`${ACCEPT_INVITATION_PATH}\` (\`src/api/pages/accept-invitation.ts\`) is where that page goes. For now it says what it needs: this project has no sign-in in the browser yet, so nothing there can sign the visitor in. Leave \`INVITATION_URL\` unset until it can.`
      : '';
  }
  return ui
    ? ` As generated, both are set for development: the email goes to the local mailbox (${MAILBOX_URL}), and \`INVITATION_URL\` defaults to \`${ACCEPT_INVITATION_PATH}\` on this app (\`APP_ORIGIN\`, else \`http://localhost:<PORT>\` in development), the page that does all of this (\`src/api/pages/accept-invitation.ts\`). In production set \`APP_ORIGIN\` (or \`INVITATION_URL\`) and a real email adapter.`
    : ` As generated, email goes to the local mailbox (${MAILBOX_URL}); set \`INVITATION_URL\` to your page and the invitations go there too.`;
};

/** A section for README.md. */
export const organizationsReadme = (auth: ProjectAuth, ui = false): string => `
## Organizations

Users share workspaces: organizations, memberships and invitations are kept in this app's own
database by \`@mariachi/organizations\` (wired in \`src/organizations.ts\`; the guide is
\`node_modules/@mariachi/core/docs/organizations.md\`).

\`\`\`bash
${auth === 'jwt' ? '# A user in no organization yet (the default development token names a tenant, which is not an organization)\nTOKEN=$(pnpm -s mariachi token --user ada --no-tenant --email ada@example.com)\n' : ''}# Create one: the caller becomes its owner
curl -X POST localhost:3000/api/organizations -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"name":"Acme Rockets"}'
# Work in it: name it on each request
curl localhost:3000/api/organizations/$ORGANIZATION_ID/members -H "authorization: Bearer $TOKEN" -H "x-organization-id: $ORGANIZATION_ID"
# Invite someone
curl -X POST localhost:3000/api/organizations/$ORGANIZATION_ID/invitations -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' -d '{"email":"ivy@example.com","role":"member"}'
\`\`\`

- **The organization a request names becomes its tenant** once the user's membership is confirmed,
  with their role (\`owner\`, \`admin\`, \`member\`) among \`ctx.identity.roles\`. An organization the user
  isn't in answers 404, the same as one that doesn't exist. A request that names none runs in ${
    auth === 'gotrue'
      ? "the user's personal tenant (see Tenants and roles above)"
      : 'no tenant: the `/api/organizations` routes work, and tenant-scoped routes answer `tenancy/missing-tenant`'
  }.
- **Invitations.** Set \`INVITATION_URL\` (the page of your app that accepts one) and an email adapter
  (\`EMAIL_ADAPTER\`, see \`.env.example\`), and the link is emailed to the invited address and never
  shown to whoever invited. Until both are set, the response to the invite carries the token and you
  pass the link on yourself. Your page signs the user in, then calls
  \`POST /api/organizations/invitations/accept\` with \`{ "token": "…" }\` as them. The token is in
  the link's fragment (\`#token=…\`), which the browser sends to no server: read it from
  \`location.hash\`, and don't copy it into a query string, a log or an analytics event.${localInvitations(auth, ui)}
- **Only the invited address can accept**, and only once it is verified. ${
    auth === 'gotrue'
      ? "GoTrue's token states that only inside `user_metadata`, which a user can rewrite, so the app needs another source. Either set `AUTH_SERVICE_KEY` (a service-role key, a secret) and it reads the user's record; a GoTrue that confirms sign-ups without sending mail (`GOTRUE_MAILER_AUTOCONFIRM`) then counts every address as unverified, because anyone can sign up as any address there. Or have an access token hook add a top-level `email_verified` claim and set `AUTH_EMAIL_VERIFIED_CLAIM=required`: the app then holds no service key and looks nothing up. With neither, accepting answers `auth/verified-email-unavailable`."
      : 'The address is read from the token: issue tokens with `email`, and with `email_verified: true` once you have confirmed it. `mariachi token --email <address>` signs a development token that says both.'
  }
- Creating, inviting and accepting are rate limited, per user and per organization. The counts are
  kept in this app's database (the \`rate_limit_buckets\` table, created by the first migration), so
  every process that serves the API shares them, with nothing more to run. With \`REDIS_URL\` set
  they are kept in Redis instead (\`pnpm add ioredis\`). \`RATE_LIMIT_ADAPTER\` (\`postgres\`,
  \`redis\` or \`memory\`) chooses for itself; \`memory\` counts each process apart.
${
  auth === 'gotrue'
    ? "- **Leave the organization out of the token.** If a hook of yours puts one there (`AUTH_ORG_CLAIM`), a request runs in that organization without naming it (the membership here still admits it, and the role comes from the membership, never the token), but a request that names a different one is refused (`tenancy/mismatch`), so a user in two organizations could not switch. Let the header name the organization.\n"
    : ''
}`;

/** `src/organizations.e2e.test.ts`: the organizations routes over HTTP, the same for both sign-in choices. */
export const organizationsE2eTest = (auth: ProjectAuth): string => `import { TestEmailAdapter } from '@mariachi/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startApp, type RunningApp } from './testing/e2e';

let running: RunningApp;
let outbox: TestEmailAdapter;
beforeAll(async () => {
  outbox = new TestEmailAdapter();
  // The emails go to the outbox; INVITATION_URL is the page the link in them opens
  running = await startApp({ mailer: outbox, env: { INVITATION_URL: 'https://app.example.test/invitations/accept' } });
});
afterAll(() => running?.stop());

// Users in no organization yet. The claims are what their token says about their email address.
const person = (userId: string, email: string, verified = true) => ({ userId, tenantId: '', claims: { email, email_verified: verified } });
const ada = person('0b9d4c53-8f0a-4d0e-9a63-5c2f1e7b3a41', 'ada@example.test');
const ivy = person('c2a1f0de-7b6c-4e59-8d3a-1f0e9b8c7d62', 'ivy@example.test');
const eve = person('e4b7a9c1-2d3f-4a5b-8c6d-7e8f9a0b1c23', 'eve@example.test');

type Listed = Array<{ organization: { id: string; name: string }; role: string }>;

async function create(name: string): Promise<string> {
  const res = await running.request('/api/organizations', { as: ada, json: { name } });
  expect(res.status).toBe(201);
  const { organization, membership } = (await res.json()) as { organization: { id: string }; membership: { role: string } };
  expect(membership.role).toBe('owner');
  return organization.id;
}

describe('organizations', () => {
  it('lets a user create an organization, and puts a request that names it in it', async () => {
    const id = await create('Acme Rockets');
    const mine = (await (await running.request('/api/organizations', { as: ada })).json()) as Listed;
    expect(mine).toContainEqual(expect.objectContaining({ organization: expect.objectContaining({ id, name: 'Acme Rockets' }), role: 'owner' }));

    const named = { 'x-organization-id': id };
    expect((await running.request(\`/api/organizations/\${id}/members\`, { as: ada, headers: named })).status).toBe(200);
    // Someone who isn't in it gets the same answer as for an organization that doesn't exist, on every route
    const outsider = await running.request('/api/organizations', { as: eve, headers: named });
    expect(outsider.status).toBe(404);
    expect(await outsider.json()).toMatchObject({ error: { code: 'organizations/not-found' } });
    expect((await running.request(\`/api/organizations/\${id}\`, { as: eve })).status).toBe(404);
  });

  it('emails the invitation to the invited address, and only that person, verified, can accept it', async () => {
    const id = await create('Invitations Inc');
    const invited = await running.request(\`/api/organizations/\${id}/invitations\`, { as: ada, json: { email: 'ivy@example.test', role: 'member' } });
    expect(invited.status).toBe(201);
    // Whoever invited never sees the token: it goes to the invited address only
    expect(await invited.json()).not.toHaveProperty('token');
    const message = outbox.getSentEmails().at(-1);
    expect(message).toMatchObject({ to: 'ivy@example.test', subject: expect.stringContaining('Invitations Inc') });
    // The token is in the link's fragment, which a browser sends to no server
    const link = new URL(/https:\\/\\/app\\.example\\.test\\/invitations\\/accept\\S+/.exec(message?.text ?? '')?.[0] ?? '');
    expect(link.search).toBe('');
    const token = new URLSearchParams(link.hash.slice(1)).get('token');

    const accept = (as: typeof ivy) => running.request('/api/organizations/invitations/accept', { as, json: { token } });
    const stranger = await accept(eve);
    expect(stranger.status).toBe(403);
    expect(await stranger.json()).toMatchObject({ error: { code: 'organizations/email-mismatch' } });
    const unverified = await accept(person(ivy.userId, 'ivy@example.test', false));
    expect(unverified.status).toBe(403);
    expect(await unverified.json()).toMatchObject({ error: { code: 'organizations/email-unverified' } });

    expect((await accept(ivy)).status).toBe(200);
    const hers = (await (await running.request('/api/organizations', { as: ivy })).json()) as Listed;
    expect(hers).toContainEqual(expect.objectContaining({ organization: expect.objectContaining({ id }), role: 'member' }));
    // The link works once
    expect((await accept(ivy)).status).toBe(400);
  });

  it('hands the token to whoever invites when no email is set up', async () => {
    const quiet = await startApp();
    try {
      const created = await quiet.request('/api/organizations', { as: ada, json: { name: 'No Mail' } });
      const { organization } = (await created.json()) as { organization: { id: string } };
      const invited = await quiet.request(\`/api/organizations/\${organization.id}/invitations\`, { as: ada, json: { email: 'ivy@example.test' } });
      expect(invited.status).toBe(201);
      expect(await invited.json()).toMatchObject({ invitation: { email: 'ivy@example.test', role: 'member' }, token: expect.any(String) });
    } finally {
      await quiet.stop();
    }
  });

  it('makes the organization a test names, with the user in it: the first one named is its owner', async () => {
    const owner = { userId: 'user-ada', tenantId: 'acme' };
    const member = { userId: 'user-lin', tenantId: 'acme' };
    const mine = (await (await running.request('/api/organizations', { as: owner })).json()) as Listed;
    expect(mine).toEqual([expect.objectContaining({ organization: expect.objectContaining({ name: 'acme' }), role: 'owner' })]);
    const theirs = (await (await running.request('/api/organizations', { as: member })).json()) as Listed;
    expect(theirs).toEqual([expect.objectContaining({ organization: expect.objectContaining({ id: mine[0]?.organization.id }), role: 'member' })]);
  });
${
  auth === 'gotrue'
    ? `
  it('cannot say whether an address is verified from a plain GoTrue token with no service key, and says so', async () => {
    const id = await create('Plain Tokens');
    await running.request(\`/api/organizations/\${id}/invitations\`, { as: ada, json: { email: 'ivy@example.test' } });
    const link = new URL(/https:\\/\\/\\S+/.exec(outbox.getSentEmails().at(-1)?.text ?? '')?.[0] ?? '');
    const token = new URLSearchParams(link.hash.slice(1)).get('token');
    // GoTrue's own token: the address, and "verified" only in user_metadata, which the user can write
    const plain = { userId: ivy.userId, tenantId: '', claims: { email: 'ivy@example.test', user_metadata: { email_verified: true } } };
    const res = await running.request('/api/organizations/invitations/accept', { as: plain, json: { token } });
    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: { code: 'auth/verified-email-unavailable' } });
  });

  it('takes the answer only from the claim when told the token hook always sets it', async () => {
    const strict = await startApp({ mailer: outbox, env: { INVITATION_URL: 'https://app.example.test/invitations/accept', AUTH_EMAIL_VERIFIED_CLAIM: 'required' } });
    try {
      const created = await strict.request('/api/organizations', { as: ada, json: { name: 'Hooked' } });
      const { organization } = (await created.json()) as { organization: { id: string } };
      await strict.request(\`/api/organizations/\${organization.id}/invitations\`, { as: ada, json: { email: 'ivy@example.test' } });
      const link = new URL(/https:\\/\\/\\S+/.exec(outbox.getSentEmails().at(-1)?.text ?? '')?.[0] ?? '');
      const token = new URLSearchParams(link.hash.slice(1)).get('token');
      // The hook says unverified (it does on a GoTrue that confirms without sending mail): refused
      const unverified = await strict.request('/api/organizations/invitations/accept', { as: person(ivy.userId, 'ivy@example.test', false), json: { token } });
      expect(await unverified.json()).toMatchObject({ error: { code: 'organizations/email-unverified' } });
      expect((await strict.request('/api/organizations/invitations/accept', { as: ivy, json: { token } })).status).toBe(200);
    } finally {
      await strict.stop();
    }
  });
`
    : ''
}});
`;
