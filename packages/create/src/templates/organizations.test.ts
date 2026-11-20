import { describe, expect, it } from 'vitest';
import { projectFiles } from './project';

const plain = { jwt: projectFiles('acme-app', '^0.1.0'), gotrue: projectFiles('acme-app', '^0.1.0', 'gotrue') };
const orgs = {
  jwt: projectFiles('acme-app', '^0.1.0', 'jwt', { organizations: true }),
  gotrue: projectFiles('acme-app', '^0.1.0', 'gotrue', { organizations: true }),
};
const AUTHS = ['jwt', 'gotrue'] as const;
const ORG_FILES = ['src/organizations.ts', 'src/schema/organizations.ts', 'src/organizations.e2e.test.ts'];

describe('a project without --orgs', () => {
  it('has no trace of organizations', () => {
    for (const auth of AUTHS) {
      const files = plain[auth];
      for (const file of ORG_FILES) expect(files[file], `${auth} ${file}`).toBeUndefined();
      const everything = Object.values(files).join('\n');
      expect(everything).not.toMatch(/@mariachi\/organizations|x-organization-id|INVITATION_URL|AUTH_SERVICE_KEY|RATE_LIMIT_ADAPTER|rateLimitBucketsTable/);
      // Nothing an expression left behind
      expect(everything).not.toMatch(/\bundefined\b\n|\[object Object\]/);
    }
  });
});

describe('a project with --orgs', () => {
  it('adds the packages, the tables and the wiring file, for either sign-in choice', () => {
    for (const auth of AUTHS) {
      const files = orgs[auth];
      const pkg = JSON.parse(files['package.json'] as string);
      for (const name of ['organizations', 'notifications', 'rate-limit']) expect(pkg.dependencies[`@mariachi/${name}`], `${auth} ${name}`).toBe('^0.1.0');
      for (const file of ORG_FILES) expect(files[file], `${auth} ${file}`).toBeTruthy();
      expect(files['src/schema/index.ts']).toContain("export * from './organizations';");
      expect(files['src/schema/organizations.ts']).toContain("export { tenantsTable } from '@mariachi/database/schema';");
      expect(files['src/api/controllers/index.ts']).toContain('new OrganizationsController(communication),');
      expect(Object.values(files).join('\n')).not.toMatch(/\bundefined\b\n|\[object Object\]/);
    }
  });

  it('checks the membership where the request becomes an identity, around whichever verifier signs users in', () => {
    expect(orgs.jwt['src/app.ts']).toContain(".withAuthStrategy('session', organizationStrategy(bearerStrategy(verifier), access))");
    expect(orgs.gotrue['src/app.ts']).toContain(".withAuthStrategy('session', organizationStrategy(bearerStrategy(auth), access))");
    // A JWT that names no tenant must verify: that is a user with no organization yet, on their way to one
    expect(orgs.jwt['src/app.ts']).toContain('audience: config.auth.jwtAudience, requireTenant: false });');
    expect(plain.jwt['src/app.ts']).not.toContain('requireTenant');
    // Personal tenants still wrap the provider, so a user who names no organization has somewhere to work
    expect(orgs.gotrue['src/app.ts']).toContain("app.auth.personalTenants ? withPersonalTenants(provider, { namespace: 'app' }) : provider");
    for (const auth of AUTHS) {
      const app = orgs[auth]['src/app.ts'] as string;
      expect(app).toContain('const { organizations, access } = setupOrganizations({');
      expect(app).toMatch(/return \{\s+api,\s+communication,\s+database,\s+jobs,\s+search,\s+organizations,/);
      // The organizations are built after the services are registered and before the API is
      expect(app.indexOf('registerServices(communication')).toBeLessThan(app.indexOf('setupOrganizations({'));
      expect(app.indexOf('setupOrganizations({')).toBeLessThan(app.indexOf('createApiServer({'));
    }
  });

  it('limits creating, inviting and accepting, and emails an invitation only when there is a page to send people to', () => {
    for (const auth of AUTHS) {
      const app = orgs[auth]['src/app.ts'] as string;
      // In the app's database, shared by every process; in Redis once there is one; RATE_LIMIT_ADAPTER overrides both
      expect(app).toContain("const rateLimitAdapter = config.rateLimit?.adapter ?? (config.redis ? 'redis' : 'postgres');");
      expect(app).toContain(
        "createRateLimiter({ adapter: rateLimitAdapter, url: config.redis?.url, db: database.db, prefix: `${config.serviceName}:rate-limit` }),",
      );
      expect(app).toContain("throw new ConfigError('app/rate-limit-redis-url-required', 'RATE_LIMIT_ADAPTER=redis needs REDIS_URL');");
      expect(app).toMatch(/^import \{ ConfigError, KEYS \} from '@mariachi\/core';$/m);
      // The limiter is built once the database is connected, and before the organizations that use it
      expect(app.indexOf('await database.connect();')).toBeLessThan(app.indexOf('createRateLimiter({'));
      expect(app.indexOf('createRateLimiter({')).toBeLessThan(app.indexOf('setupOrganizations({'));
      // Nothing left of the per-process counts, or of the warning that REDIS_URL is needed to share them
      expect(app).not.toContain("createRateLimiter({ adapter: 'memory' })");
      expect(app).not.toContain("setting: 'REDIS_URL'");
      // The first migration creates the table the counts live in
      expect(orgs[auth]['src/schema/organizations.ts']).toContain("export { rateLimitBucketsTable } from '@mariachi/rate-limit/schema';");
      const env = orgs[auth]['.env.example'] as string;
      expect(env).toMatch(/^# RATE_LIMIT_ADAPTER=postgres$/m);
      expect(env).toContain('RATE_LIMIT_ADAPTER chooses for itself: postgres, redis (needs REDIS_URL) or\n# memory (each process counts apart: one process only).');
      // The README and AGENTS.md say where the counts are, and how to move them
      const readme = orgs[auth]['README.md'] as string;
      expect(readme).toContain('kept in this app\'s database (the `rate_limit_buckets` table, created by the first migration)');
      expect(readme).toContain('`RATE_LIMIT_ADAPTER` (`postgres`,');
      expect(readme).not.toContain("this process's memory");
      expect(orgs[auth]['AGENTS.md']).toContain('`RATE_LIMIT_ADAPTER` overrides the choice.');
      expect(app).toContain('mailer: options.mailer ?? (config.email ? createEmailAdapter({ email: config.email }) : undefined),');
      expect(app).toContain('invitationUrl: app.invitationUrl,');
      const wiring = orgs[auth]['src/organizations.ts'] as string;
      expect(wiring).toContain('deps.mailer && deps.invitationUrl ? invitationEmail({ email: deps.mailer, acceptUrl: deps.invitationUrl, appName: deps.appName }) : undefined');
      expect(wiring).toContain('registerOrganizationProcedures(deps.communication, organizations, { limiter: deps.limiter, deliverInvitation });');
      expect(orgs[auth]['src/config.ts']).toContain("invitationUrl: optional(read('INVITATION_URL'))");
      expect(orgs[auth]['.env.example']).toContain('# INVITATION_URL=');
    }
  });

  it("reads a GoTrue user's verified email from where the user can't write, and keeps the key a secret", () => {
    const app = orgs.gotrue['src/app.ts'] as string;
    expect(app).toMatch(/verifiedEmail: goTrueVerifiedEmail\(\{\s+url: goTrueConfig\(app\.auth\)\.url,\s+serviceKey: app\.auth\.serviceKey,\s+requireClaim: app\.auth\.emailVerifiedClaim === 'required',\s+\}\),/);
    // Warns only when neither source of the answer is set up
    expect(app).toContain("if (!app.auth.serviceKey && app.auth.emailVerifiedClaim !== 'required') {");
    const config = orgs.gotrue['src/config.ts'] as string;
    expect(config).toContain("import { registerConfigSection, secret } from '@mariachi/config';");
    expect(config).toContain('serviceKey: secret(z.string()).optional(),');
    expect(config).toContain("serviceKey: optional(read('AUTH_SERVICE_KEY')),");
    expect(config).toContain("emailVerifiedClaim: z.enum(['optional', 'required']).default('optional'),");
    expect(config).toContain("emailVerifiedClaim: optional(read('AUTH_EMAIL_VERIFIED_CLAIM')),");
    expect(orgs.gotrue['.env.example']).toContain('# AUTH_EMAIL_VERIFIED_CLAIM=optional');
    // Listed empty for the project's own key: .env has one for the local GoTrue (see local-auth.test.ts)
    expect(orgs.gotrue['.env.example']).toMatch(/^AUTH_SERVICE_KEY=$/m);
    expect(orgs.gotrue['.env']).toMatch(/^AUTH_SERVICE_KEY=eyJ[\w-]+\.[\w-]+\.[\w-]+$/m);
    // A JWT project reads the address from the token it issued itself
    expect(orgs.jwt['src/app.ts']).not.toContain('verifiedEmail');
    expect(orgs.jwt['.env.example']).not.toContain('AUTH_SERVICE_KEY');
  });

  it('has the test harness name the organization in the header, as a client does, and never in the token', () => {
    expect(orgs.jwt['src/testing/e2e.ts']).toContain("...(request.as ? { ...auth.headersFor({ ...request.as, tenantId: '' }), ...(await organizationFor(request.as)) } : {}),");
    const gotrue = orgs.gotrue['src/testing/e2e.ts'] as string;
    expect(gotrue).toContain('? { ...auth.headersForClaims(claimsFor(request.as)), ...(await organizationFor(request.as)) }');
    expect(gotrue).not.toContain('settings().orgClaim');
    for (const auth of AUTHS) {
      const harness = orgs[auth]['src/testing/e2e.ts'] as string;
      expect(harness).toContain("return { 'x-organization-id': organizationId };");
      expect(harness).toContain("const role = created ? 'member' : 'owner';");
    }
    // Without --orgs the harness is what it was
    expect(plain.jwt['src/testing/e2e.ts']).toContain('...(request.as ? auth.headersFor(request.as) : {}),');
    expect(plain.gotrue['src/testing/e2e.ts']).toContain('...(identity.tenantId ? { [settings().orgClaim]: identity.tenantId } : {}),');
  });

  it('explains itself in the README and to agents, and leaves the end-to-end test out with --no-e2e', () => {
    for (const auth of AUTHS) {
      expect(orgs[auth]['README.md']).toContain('## Organizations');
      expect(orgs[auth]['AGENTS.md']).toContain('## Organizations');
      const bare = projectFiles('acme-app', '^0.1.0', auth, { organizations: true, e2e: false });
      expect(bare['src/organizations.e2e.test.ts']).toBeUndefined();
      expect(bare['src/organizations.ts']).toBeTruthy();
    }
    expect(orgs.gotrue['README.md']).toContain('GOTRUE_MAILER_AUTOCONFIRM');
    expect(orgs.gotrue['README.md']).toContain('goes to the local mailbox (http://localhost:8025)');
    expect(orgs.gotrue['src/app.e2e.test.ts']).toContain('puts a member in the organization the request names');
    expect(plain.gotrue['src/app.e2e.test.ts']).toContain('puts a member in their organization, with the role the token gives them there');
  });
});

describe('a GoTrue project with --orgs, in development', () => {
  it('emails invitations to the local mailbox over SMTP, with nodemailer installed to send them', () => {
    const env = orgs.gotrue['.env.example'] as string;
    expect(env).toMatch(/^EMAIL_ADAPTER=smtp$/m);
    expect(env).toMatch(/^SMTP_URL=smtp:\/\/localhost:1025$/m);
    expect(env).toMatch(/^EMAIL_FROM=\S+@\S+$/m);
    expect(JSON.parse(orgs.gotrue['package.json'] as string).dependencies.nodemailer).toMatch(/^\^\d+/);
    // A JWT project has no mailbox in its Compose file, and so no email set up
    expect(orgs.jwt['.env.example']).toMatch(/^# EMAIL_ADAPTER=$/m);
    expect(JSON.parse(orgs.jwt['package.json'] as string).dependencies.nodemailer).toBeUndefined();
    expect(JSON.parse(plain.gotrue['package.json'] as string).dependencies.nodemailer).toBeUndefined();
  });
});
