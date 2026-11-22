import { generateKeyPairSync } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { DEFAULT_PAGE_CSP, html } from '@mariachi/api-facade';
import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { importSPKI, jwtVerify } from 'jose';
import { describe, expect, it } from 'vitest';
import { createGoogleAnalytics } from './client';
import { gaCookies } from './cookies';
import { GoogleAnalyticsError } from './errors';
import { generateLead, login, purchase, signUp } from './events';
import { settings } from './generated';
import { reportRows } from './reports';
import { consentUpdate, gtagCsp, gtagSnippet } from './tag';
import { fakeGoogleAnalytics, gaReport } from './testing';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const SECRET = 'mp-secret-value-123';
const config = { measurementId: 'G-ABC123', apiSecret: SECRET };
const noWait = { sleep: async () => {} };

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const serviceAccountJson = JSON.stringify({
  type: 'service_account',
  client_email: 'reports@app-test.iam.gserviceaccount.com',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  private_key_id: 'key-1',
});
const reportsConfig = { measurementId: 'G-ABC123', propertyId: '123456789', serviceAccountJson };
const token = { json: { access_token: 'ya29.token', expires_in: 3599, token_type: 'Bearer' } };

describe('the page tag', () => {
  it('loads the setup script before gtag.js, everything denied by default', () => {
    expect(gtagSnippet({ measurementId: 'G-ABC123' }).value).toBe(
      '<script src="/assets/lib/gtag.js" data-measurement-id="G-ABC123"></script>\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>',
    );
  });

  it('carries what the visitor already granted, and goes into a page as markup', () => {
    const snippet = gtagSnippet({ measurementId: 'G-ABC123', consent: { analytics_storage: true, ad_storage: false } });
    expect(snippet.value).toContain('data-granted="analytics_storage"');
    expect(html`<head>${snippet}</head>`.value).toContain('<script async src="https://www.googletagmanager.com/gtag/js?id=G-ABC123">');
  });

  it('refuses a measurement ID that is not G- and capitals and digits', () => {
    for (const id of ['UA-1234-1', 'G-abc', 'G-1"><script>alert(1)</script>', '', 'GTM-ABC']) {
      expect(() => gtagSnippet({ measurementId: id })).toThrow(GoogleAnalyticsError);
    }
    expect(() => gtagSnippet({ measurementId: 'G-1"' })).toThrow(expect.objectContaining({ code: 'google-analytics/invalid-measurement-id' }));
  });

  it('names every consent type in an update', () => {
    expect(consentUpdate({ analytics_storage: true, ad_user_data: true })).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'granted',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
  });

  it("widens the page's policy for Google's tag, and nothing else", () => {
    expect(gtagCsp()).toBe(
      "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com https://*.google-analytics.com; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' https://www.googletagmanager.com; connect-src 'self' https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com",
    );
    expect(gtagCsp()).not.toContain('unsafe-inline\'; script');
    expect(DEFAULT_PAGE_CSP).not.toContain('googletagmanager');
    expect(gtagCsp("default-src 'none'; script-src-elem 'self'")).toBe(
      "default-src 'none'; script-src-elem 'self' https://www.googletagmanager.com; script-src https://www.googletagmanager.com; img-src https://www.googletagmanager.com https://*.google-analytics.com; connect-src https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com",
    );
  });
});

describe('the setup script (browser/gtag.js)', () => {
  const source = readFileSync(fileURLToPath(new URL('../browser/gtag.js', import.meta.url)), 'utf8');

  function run(attributes: Record<string, string>) {
    const window: { dataLayer?: unknown[]; gtag?: unknown } = {};
    const currentScript = { getAttribute: (name: string) => attributes[name] ?? null };
    runInNewContext(source, { window, document: { currentScript } });
    return window;
  }

  it('sets Consent Mode defaults before config, as gtag.js reads them', () => {
    const window = run({ 'data-measurement-id': 'G-ABC123' });
    const layer = (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
    expect(layer.map((a) => a.slice(0, 2))).toEqual([['consent', 'default'], ['js', expect.anything()], ['config', 'G-ABC123']]);
    expect(layer[0]![2]).toEqual({ ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
    // gtag.js takes the queue as `arguments` objects, as Google's snippet pushes them
    expect(Object.prototype.toString.call(window.dataLayer![0])).toBe('[object Arguments]');
    expect(typeof window.gtag).toBe('function');
  });

  it('grants what the page says was granted, after the defaults', () => {
    const window = run({ 'data-measurement-id': 'G-ABC123', 'data-granted': 'analytics_storage bogus' });
    const layer = (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>));
    expect(layer.slice(0, 2)).toEqual([
      ['consent', 'default', expect.anything()],
      ['consent', 'update', { analytics_storage: 'granted' }],
    ]);
  });

  it('does nothing with a bad measurement ID', () => {
    expect(run({ 'data-measurement-id': 'G-1);alert(1' }).dataLayer).toBeUndefined();
  });
});

describe('gaCookies', () => {
  it("reads the client ID from _ga and the session from the stream's cookie", () => {
    const header = 'theme=dark; _ga=GA1.1.1234567890.1712345678; _ga_ABC123=GS2.1.s1712345678$o3$g1$t1712345999$j60$l0$h0';
    expect(gaCookies(header, 'G-ABC123')).toEqual({ clientId: '1234567890.1712345678', sessionId: 'GS2.1.s1712345678$o3$g1$t1712345999$j60$l0$h0' });
    expect(gaCookies({ _ga: 'GA1.2.42.1700000000' })).toEqual({ clientId: '42.1700000000' });
  });

  it('gives nothing when the tag set no cookies (no consent), and keeps an unknown format whole', () => {
    expect(gaCookies('theme=dark', 'G-ABC123')).toEqual({});
    expect(gaCookies(undefined)).toEqual({});
    expect(gaCookies({ _ga: 'GA2.x' }).clientId).toBe('GA2.x');
  });
});

describe('recommended events', () => {
  it("builds them with Google's parameter names", () => {
    expect(signUp({ method: 'email' })).toEqual({ name: 'sign_up', params: { method: 'email' } });
    expect(login()).toEqual({ name: 'login', params: {} });
    expect(generateLead({ value: 50, currency: 'EUR', leadSource: 'Contact form' })).toEqual({ name: 'generate_lead', params: { value: 50, currency: 'EUR', lead_source: 'Contact form' } });
    expect(purchase({ transactionId: 'ord_1', value: 30, currency: 'USD', tax: 2.4, items: [{ itemId: 'pro', itemName: 'Pro plan', price: 30, quantity: 1 }] })).toEqual({
      name: 'purchase',
      params: { transaction_id: 'ord_1', value: 30, currency: 'USD', tax: 2.4, items: [{ item_id: 'pro', item_name: 'Pro plan', price: 30, quantity: 1 }] },
    });
  });

  it('refuses what Google would drop', () => {
    expect(() => purchase({ transactionId: 'o', value: 1, currency: 'usd', items: [{ itemId: 'x' }] })).toThrow(expect.objectContaining({ code: 'validation/invalid-input' }));
    expect(() => purchase({ transactionId: 'o', value: 1, currency: 'USD', items: [{ price: 1 }] })).toThrow();
    expect(() => generateLead({ value: 10 })).toThrow();
  });
});

describe('server events', () => {
  it('posts to /mp/collect with the id and secret in the query, one span, and the secret on none of it', async () => {
    const fetch = scriptedFetch({ status: 204 });
    const tracer = new TestTracer();
    await createGoogleAnalytics(config, { fetch, tracer }).events.send(ctx, {
      clientId: '42.1700000000',
      userId: 'usr_1',
      sessionId: '1712345678',
      consent: { adUserData: false },
      events: [signUp({ method: 'email' })],
    });
    const [req] = fetch.requests;
    expect([req!.method, req!.url.origin, req!.url.pathname]).toEqual(['POST', 'https://www.google-analytics.com', '/mp/collect']);
    expect(Object.fromEntries(req!.url.searchParams)).toEqual({ measurement_id: 'G-ABC123', api_secret: SECRET });
    expect(req!.json).toEqual({
      client_id: '42.1700000000',
      user_id: 'usr_1',
      consent: { ad_user_data: 'DENIED' },
      events: [{ name: 'sign_up', params: { method: 'email', session_id: '1712345678' } }],
    });
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address'], s.attributes['mariachi.integration.category']])).toEqual([
      ['google-analytics events.send', 'client', 'www.google-analytics.com', 'analytics'],
    ]);
    assertProviderSpans(tracer.spans);
    expect(JSON.stringify(tracer.spans)).not.toContain(SECRET);
  });

  it('keeps the secret out of the error when Google fails or cannot be reached', async () => {
    const tracer = new TestTracer();
    const ga = createGoogleAnalytics(config, { fetch: scriptedFetch({ status: 500, text: `error for ${SECRET}` }), tracer, ...noWait });
    const failed = await ga.events.send(ctx, { clientId: '1.2', events: [login()] }).catch((e) => e);
    expect(failed).toBeInstanceOf(GoogleAnalyticsError);
    // A send is not retried after an outage: Google may have recorded it
    expect([failed.code, failed.category]).toEqual(['google-analytics/unavailable', 'unavailable']);

    const unreachable = (async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;
    const down = await createGoogleAnalytics(config, { fetch: unreachable, tracer, ...noWait }).events.send(ctx, { clientId: '1.2', events: [login()] }).catch((e) => e);
    expect(down.code).toBe('google-analytics/unavailable');
    for (const e of [failed, down]) expect(`${e.message} ${e.stack} ${JSON.stringify(e)} ${JSON.stringify(e.metadata ?? {})}`).not.toContain(SECRET);
    expect(JSON.stringify(tracer.spans)).not.toContain(SECRET);
    assertProviderSpans(tracer.spans);
  });

  it('sends to the EU endpoint when the region is eu, and retries a rate limit', async () => {
    const fetch = scriptedFetch({ status: 429, headers: { 'retry-after': '0' } }, { status: 204 });
    await createGoogleAnalytics({ ...config, region: 'eu' }, { fetch, ...noWait }).events.send(ctx, { clientId: '1.2', events: [login()] });
    expect(fetch.requests.map((r) => r.url.host)).toEqual(['region1.google-analytics.com', 'region1.google-analytics.com']);
  });

  it('validates at /debug/mp/collect with the strict checks, and returns what is wrong', async () => {
    const messages = [{ fieldPath: 'events', description: 'Event at index: [0] has invalid name.', validationCode: 'NAME_INVALID' }];
    const fetch = scriptedFetch({ json: { validationMessages: messages } }, { json: { validationMessages: [] } });
    const tracer = new TestTracer();
    const ga = createGoogleAnalytics(config, { fetch, tracer });
    expect(await ga.events.validate(ctx, { clientId: '1.2', events: [{ name: 'my_event', params: { plan: 'pro' } }] })).toEqual(messages);
    expect(await ga.events.validate(ctx, { clientId: '1.2', events: [login()] })).toEqual([]);
    expect(fetch.requests[0]!.url.pathname).toBe('/debug/mp/collect');
    expect((fetch.requests[0]!.json as { validation_behavior: string }).validation_behavior).toBe('ENFORCE_RECOMMENDATIONS');
    expect(tracer.spans[0]!.name).toBe('google-analytics events.validate');
    assertProviderSpans(tracer.spans);
  });

  it('checks events before sending them, and needs the API secret', async () => {
    const ga = createGoogleAnalytics(config, { fetch: scriptedFetch() });
    const bad = [
      { clientId: '1.2', events: [] },
      { clientId: '', events: [login()] },
      { clientId: '1.2', events: [{ name: 'session_start' }] },
      { clientId: '1.2', events: [{ name: '_private' }] },
      { clientId: '1.2', events: [{ name: 'ok', params: { ga_thing: 1 } }] },
      { clientId: '1.2', events: Array.from({ length: 26 }, () => login()) },
    ];
    for (const input of bad) await expect(ga.events.send(ctx, input)).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(createGoogleAnalytics({ measurementId: 'G-ABC123' }).events.send(ctx, { clientId: '1.2', events: [login()] })).rejects.toMatchObject({ code: 'google-analytics/no-api-secret' });
  });
});

describe('reports', () => {
  const report = {
    dimensionHeaders: [{ name: 'pagePath' }],
    metricHeaders: [{ name: 'screenPageViews', type: 'TYPE_INTEGER' }, { name: 'averageSessionDuration', type: 'TYPE_SECONDS' }],
    rows: [
      { dimensionValues: [{ value: '/pricing' }], metricValues: [{ value: '1204' }, { value: '81.5' }] },
      { dimensionValues: [{ value: '/' }], metricValues: [{ value: '980' }, { value: '40' }] },
    ],
    rowCount: 2,
    kind: 'analyticsData#runReport',
  };

  it("signs in as the service account, runs the report, and reuses the token", async () => {
    const fetch = scriptedFetch(token, { json: report }, { json: { ...report, kind: 'analyticsData#runRealtimeReport' } });
    const tracer = new TestTracer();
    const ga = createGoogleAnalytics(reportsConfig, { fetch, tracer });
    const result = await ga.reports.run(ctx, {
      dimensions: ['pagePath'],
      metrics: ['screenPageViews', 'averageSessionDuration'],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      limit: 10,
      orderBys: [{ metric: 'screenPageViews', desc: true }],
    });
    expect(reportRows(result)).toEqual([
      { pagePath: '/pricing', screenPageViews: 1204, averageSessionDuration: 81.5 },
      { pagePath: '/', screenPageViews: 980, averageSessionDuration: 40 },
    ]);

    const [tokenReq, reportReq] = fetch.requests;
    expect(tokenReq!.url.href).toBe('https://oauth2.googleapis.com/token');
    const form = new URLSearchParams(tokenReq!.body);
    expect(form.get('grant_type')).toBe('urn:ietf:params:oauth:grant-type:jwt-bearer');
    const pem = publicKey.export({ type: 'spki', format: 'pem' }) as string;
    const { payload, protectedHeader } = await jwtVerify(form.get('assertion')!, await importSPKI(pem, 'RS256'), { audience: 'https://oauth2.googleapis.com/token', issuer: 'reports@app-test.iam.gserviceaccount.com' });
    expect([payload.scope, protectedHeader.kid, (payload.exp as number) - (payload.iat as number)]).toEqual(['https://www.googleapis.com/auth/analytics.readonly', 'key-1', 3600]);

    expect(reportReq!.url.href).toBe('https://analyticsdata.googleapis.com/v1beta/properties/123456789:runReport');
    expect(reportReq!.headers.authorization).toBe('Bearer ya29.token');
    expect(reportReq!.json).toEqual({
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    });

    await ga.reports.runRealtime(ctx, { metrics: ['activeUsers'], minuteRanges: [{ startMinutesAgo: 5, endMinutesAgo: 0 }] });
    expect(fetch.requests).toHaveLength(3);
    expect(fetch.requests[2]!.url.pathname).toBe('/v1beta/properties/123456789:runRealtimeReport');
    expect(fetch.requests[2]!.json).toEqual({ dimensions: [], metrics: [{ name: 'activeUsers' }], minuteRanges: [{ startMinutesAgo: 5, endMinutesAgo: 0 }] });

    expect(tracer.spans.map((s) => [s.name, s.attributes['server.address']])).toEqual([
      ['google-analytics serviceAccount.token', 'oauth2.googleapis.com'],
      ['google-analytics reports.run', 'analyticsdata.googleapis.com'],
      ['google-analytics reports.runRealtime', 'analyticsdata.googleapis.com'],
    ]);
    assertProviderSpans(tracer.spans);
    expect(JSON.stringify(tracer.spans)).not.toContain('ya29');
  });

  it("reads an empty report, which Google sends without rows", async () => {
    const ga = createGoogleAnalytics(reportsConfig, { fetch: scriptedFetch(token, { json: { dimensionHeaders: [{ name: 'country' }], metricHeaders: [{ name: 'activeUsers', type: 'TYPE_INTEGER' }], kind: 'analyticsData#runReport' } }) });
    const result = await ga.reports.run(ctx, { dimensions: ['country'], metrics: ['activeUsers'], dateRanges: [{ startDate: '2026-11-01', endDate: '2026-11-20' }] });
    expect([reportRows(result), result.rowCount]).toEqual([[], 0]);
  });

  it("fails with Google's status, not its message, and fetches a new token after one is refused", async () => {
    const denied = { status: 403, json: { error: { code: 403, message: 'User does not have sufficient permissions for this property.', status: 'PERMISSION_DENIED' } } };
    const unauthenticated = { status: 401, json: { error: { code: 401, message: 'Request had invalid authentication credentials.', status: 'UNAUTHENTICATED' } } };
    const fetch = scriptedFetch(token, denied, unauthenticated, token, { json: report });
    const ga = createGoogleAnalytics(reportsConfig, { fetch, ...noWait });
    const input = { metrics: ['activeUsers'], dateRanges: [{ startDate: 'yesterday', endDate: 'today' }] };
    const err = await ga.reports.run(ctx, input).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['google-analytics/permission-denied', 'forbidden', 'PERMISSION_DENIED']);
    expect(err.message).not.toContain('permissions');
    await expect(ga.reports.run(ctx, input)).rejects.toMatchObject({ code: 'google-analytics/unauthenticated' });
    await ga.reports.run(ctx, input);
    expect(fetch.requests.map((r) => r.url.host)).toEqual(['oauth2.googleapis.com', 'analyticsdata.googleapis.com', 'analyticsdata.googleapis.com', 'oauth2.googleapis.com', 'analyticsdata.googleapis.com']);
  });

  it("fails clearly when the key is refused, or reports aren't set up", async () => {
    const refused = { status: 400, json: { error: 'invalid_grant', error_description: 'Invalid JWT Signature.' } };
    const err = await createGoogleAnalytics(reportsConfig, { fetch: scriptedFetch(refused) }).reports.run(ctx, { metrics: ['sessions'], dateRanges: [{ startDate: 'today', endDate: 'today' }] }).catch((e) => e);
    expect([err.code, err.category]).toEqual(['google-analytics/invalid-grant', 'unauthorized']);
    const input = { metrics: ['sessions'], dateRanges: [{ startDate: 'today', endDate: 'today' }] };
    await expect(createGoogleAnalytics({ measurementId: 'G-ABC123', serviceAccountJson }).reports.run(ctx, input)).rejects.toMatchObject({ code: 'google-analytics/no-property-id' });
    await expect(createGoogleAnalytics({ measurementId: 'G-ABC123', propertyId: '1' }).reports.run(ctx, input)).rejects.toMatchObject({ code: 'google-analytics/no-service-account' });
    await expect(createGoogleAnalytics(reportsConfig, { fetch: scriptedFetch() }).reports.run(ctx, { metrics: [], dateRanges: [{ startDate: 'today', endDate: 'today' }] })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(createGoogleAnalytics(reportsConfig, { fetch: scriptedFetch() }).reports.run(ctx, { metrics: ['sessions'], dateRanges: [{ startDate: 'last week', endDate: 'today' }] })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    expect(settingsFromEnv(settings, (n) => ({ GA_MEASUREMENT_ID: 'G-ABC123', GA_REGION: 'eu' })[n])).toEqual({ measurementId: 'G-ABC123', region: 'eu' });
    expect(() => settingsFromEnv(settings, () => undefined)).toThrow(/GA_MEASUREMENT_ID/);
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', 'G-ABC123')).toBeNull();
  });

  it('refuses settings it cannot work with at startup', () => {
    expect(() => createGoogleAnalytics({ measurementId: 'UA-1-1' })).toThrow(expect.objectContaining({ code: 'google-analytics/invalid-measurement-id' }));
    expect(() => createGoogleAnalytics({ measurementId: 'G-ABC123', region: 'us' })).toThrow(expect.objectContaining({ code: 'google-analytics/invalid-region' }));
    expect(() => createGoogleAnalytics({ measurementId: 'G-ABC123', propertyId: 'G-ABC123' })).toThrow(expect.objectContaining({ code: 'google-analytics/invalid-property-id' }));
    expect(() => createGoogleAnalytics({ measurementId: 'G-ABC123', serviceAccountJson: '{"type":"authorized_user"}' })).toThrow(expect.objectContaining({ code: 'google-analytics/invalid-service-account' }));
  });
});

describe('the fake', () => {
  it("stands in for the client in an app's tests", async () => {
    const ga = fakeGoogleAnalytics({ report: gaReport({ dimensions: ['pagePath'], metrics: ['screenPageViews'], rows: [['/pricing', 12]] }) });
    await ga.events.send(ctx, { clientId: '1.2', events: [purchase({ transactionId: 'o1', value: 9, currency: 'USD', items: [{ itemId: 'pro' }] })] });
    expect(ga.sent.map((s) => s.events[0]!.name)).toEqual(['purchase']);
    await expect(ga.events.send(ctx, { clientId: '1.2', events: [{ name: 'first_visit' }] })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    const report = await ga.reports.run(ctx, { metrics: ['screenPageViews'], dateRanges: [{ startDate: 'today', endDate: 'today' }] });
    expect(reportRows(report)).toEqual([{ pagePath: '/pricing', screenPageViews: 12 }]);
  });
});
