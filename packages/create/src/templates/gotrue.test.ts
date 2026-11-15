import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Script } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { createProject } from '../generators';
import { AUTH_PATH } from './gotrue';
import { projectFiles } from './project';

const files = projectFiles('acme-app', '^0.1.0', 'gotrue');
const base = projectFiles('acme-app', '^0.1.0');
const pkg = JSON.parse(files['package.json']);

/** The string a generated `export const NAME = \`...\`;` holds. */
function constant(source: string, name: string): string {
  const start = source.indexOf(`export const ${name} = \``);
  expect(start).toBeGreaterThan(-1);
  const body = source.slice(source.indexOf('`', start) + 1);
  return body.slice(0, body.indexOf('`;'));
}

describe('mariachi init --auth gotrue', () => {
  it('adds the GoTrue provider and tenancy, and otherwise runs like the default project', () => {
    expect(pkg.dependencies).toMatchObject({ '@mariachi/auth-gotrue': '^0.1.0', '@mariachi/tenancy': '^0.1.0', '@mariachi/auth': '^0.1.0', '@mariachi/config': '^0.1.0' });
    const framework = Object.keys(pkg.dependencies).filter((d) => d.startsWith('@mariachi/'));
    expect(framework).toEqual([...framework].sort());
    const basePkg = JSON.parse(base['package.json']);
    expect(pkg.scripts).toEqual(basePkg.scripts);
    expect(pkg.engines).toEqual(basePkg.engines);
    expect(files['docker-compose.yml']).toBe(base['docker-compose.yml']);
  });

  it('writes the sign-in page, /api/me and the auth wiring, and nothing else', () => {
    expect(Object.keys(files).filter((f) => !(f in base)).sort()).toEqual([
      'src/api/controllers/me.controller.test.ts',
      'src/api/controllers/me.controller.ts',
      'src/api/controllers/sign-in.controller.test.ts',
      'src/api/controllers/sign-in.controller.ts',
      'src/api/pages/fake-browser.ts',
      'src/api/pages/sign-in.test.ts',
      'src/api/pages/sign-in.ts',
      'src/auth.test.ts',
      'src/auth.ts',
      'src/config.ts',
    ]);
    const main = files['src/main.ts'];
    expect(main).toContain('createGoTrueAuth(goTrueConfig(app.auth))');
    expect(main).toContain("withPersonalTenants(provider, { namespace: 'app' })");
    expect(main).toContain("createTenancy({ strategy: 'jwt-claim', claimName: app.auth.orgClaim }, instrumentation)");
    expect(main).toContain('.withMiddleware(createTenancyMiddleware(tenancy))');
    expect(main).toContain('bearerStrategy(auth)');
    expect(main).not.toMatch(/JWTAdapter|JWT_SECRET|jwtSecret/);
    expect(files['.env.example']).not.toContain('JWT_SECRET');
    expect(files['.env.example']).toMatch(/^AUTH_URL=$/m);
    expect(files['src/api/controllers/index.ts']).toMatch(/new MeController\(communication\),\n\s+new SignInController\(communication\),\n\s+\/\/ mariachi:controllers/);
  });

  it('generates nothing that belongs to one hosting platform', () => {
    expect(Object.keys(files).filter((f) => /environment\.json$|^\.env\.(?!example$)|^seed\//.test(f))).toEqual([]);
    for (const [path, content] of Object.entries(files)) {
      expect(content, path).not.toMatch(/preview mailbox|\bpersonas?\b|seed\/users/i);
    }
  });

  it('ships a sign-in page whose script compiles and calls the GoTrue endpoints', () => {
    const page = files['src/api/pages/sign-in.ts'];
    const js = constant(page, 'SIGN_IN_JS');
    // The served script starts with the two settings signInScript writes in.
    expect(() => new Script(`const AUTH = ${JSON.stringify(AUTH_PATH)};\nconst ANON_KEY = null;\nconst LINK_SESSIONS = false;\n${js}`)).not.toThrow();
    for (const endpoint of ['/token?grant_type=password', '/signup?redirect_to=', '/otp?redirect_to=', '/token?grant_type=pkce', '/token?grant_type=refresh_token', '/logout']) {
      expect(js).toContain(endpoint);
    }
    // Emailed links use PKCE, and a session is saved only from a response body, never from the address bar
    expect(js).toContain("code_challenge_method: 's256'");
    const saved = [...js.matchAll(/\bsave\((.*)$/gm)].map((m) => m[1] as string).filter((arg) => !arg.startsWith('session) {'));
    // From a GoTrue response, or (only with AUTH_LINK_SESSIONS, after the user's click) the session a link offered
    expect(saved).toHaveLength(5);
    for (const arg of saved) expect(arg === 'result);' || arg === 'session);' || arg.startsWith("await gotrue('"), arg).toBe(true);
    expect(js).toContain('if (!LINK_SESSIONS) return show(');
    expect(js).toContain('if (ANON_KEY) headers.apikey = ANON_KEY;');
    expect(page).toContain('export function signInScript(');
    expect(constant(page, 'SIGN_IN_HTML')).toContain('<script type="module" src="/api/sign-in/client.js"></script>');
  });

  it('refuses an unknown auth choice before touching the directory', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'mariachi-auth-'));
    try {
      await expect(createProject({ name: 'x', outputDir: join(dir, 'x'), auth: 'clerk' as never })).rejects.toMatchObject({ code: 'create/invalid-auth' });
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});

describe('the default project', () => {
  it("creates the database its DATABASE_URL names, so the first migrate has somewhere to go", () => {
    const compose = parseYaml(base['docker-compose.yml']) as { services: Record<string, { environment?: Record<string, string> }> };
    expect(compose.services.postgres.environment?.POSTGRES_DB).toBe('acme_app');
    expect(base['.env.example']).toContain('DATABASE_URL=postgres://postgres:postgres@localhost:5432/acme_app');
    const scoped = projectFiles('@acme/My-App', '^0.1.0');
    const scopedCompose = parseYaml(scoped['docker-compose.yml']) as { services: Record<string, { environment?: Record<string, string> }> };
    expect(scoped['.env.example']).toContain(`/${scopedCompose.services.postgres.environment?.POSTGRES_DB}\n`);
  });
});
