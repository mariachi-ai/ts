import { createContext } from '@mariachi/core';
import { checkSetting, settingsFromEnv } from '@mariachi/integrations';
import { assertProviderSpans, scriptedFetch } from '@mariachi/integrations/testing';
import { TestTracer } from '@mariachi/testing';
import { WebhookController, WebhookServer } from '@mariachi/webhooks';
import { describe, expect, it } from 'vitest';
import { createSalesforce, noteHtml } from './client';
import { SalesforceError } from './errors';
import { settings } from './generated';
import { Contact } from './schemas';
import { soql, soqlLike } from './soql';
import { fakeSalesforce, salesforceFlowWebhook } from './testing';
import { SalesforceFlowEvent, salesforceEventType, salesforceFlowWebhookAuth } from './webhooks';

const logger = { info() {}, warn() {}, error() {}, debug() {}, child() { return logger; } };
const ctx = createContext({ logger });
const config = { instanceUrl: 'https://acme.my.salesforce.com/', clientId: 'consumer-key', clientSecret: 'consumer-secret' };
const noWait = { sleep: async () => {} };
const token = { json: { access_token: 'tok-1', instance_url: 'https://acme.my.salesforce.com', token_type: 'Bearer', issued_at: '1763719200000', signature: 'sig' } };
const page = (records: unknown[], more?: string) => ({ json: { totalSize: records.length, done: !more, records, ...(more ? { nextRecordsUrl: more } : {}) } });
const CONTACT = '003000000000001AAA';
const ACCOUNT = '001000000000001AAA';
const DEAL = '006000000000001AAA';

describe('signing in', () => {
  it('gets a token by the client credentials flow once, and calls with it', async () => {
    const fetch = scriptedFetch(token, page([]), page([]));
    const tracer = new TestTracer();
    const sf = createSalesforce(config, { fetch, tracer });
    await sf.soql.query(ctx, soql`SELECT Id FROM Account`);
    await sf.soql.query(ctx, soql`SELECT Id FROM Contact`);
    const [tokenReq, first, second] = fetch.requests;
    expect([tokenReq!.method, tokenReq!.url.href, tokenReq!.headers['content-type']]).toEqual(['POST', 'https://acme.my.salesforce.com/services/oauth2/token', 'application/x-www-form-urlencoded']);
    expect(Object.fromEntries(new URLSearchParams(tokenReq!.body))).toEqual({ grant_type: 'client_credentials', client_id: 'consumer-key', client_secret: 'consumer-secret' });
    expect([first!.headers.authorization, second!.headers.authorization]).toEqual(['Bearer tok-1', 'Bearer tok-1']);
    expect(first!.url.pathname).toBe('/services/data/v68.0/query');
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['server.address']])).toEqual([
      ['salesforce oauth.token', 'client', 'acme.my.salesforce.com'],
      ['salesforce soql.query', 'client', 'acme.my.salesforce.com'],
      ['salesforce soql.query', 'client', 'acme.my.salesforce.com'],
    ]);
    assertProviderSpans(tracer.spans);
  });

  it('asks for a new token when a call answers 401, and repeats the call once', async () => {
    const fetch = scriptedFetch(token, { status: 401, json: [{ errorCode: 'INVALID_SESSION_ID', message: 'Session expired or invalid' }] }, { json: { access_token: 'tok-2' } }, page([]));
    await createSalesforce(config, { fetch }).soql.query(ctx, soql`SELECT Id FROM Account`);
    expect(fetch.requests.map((r) => `${r.method} ${r.url.pathname} ${r.headers.authorization ?? ''}`.trim())).toEqual([
      'POST /services/oauth2/token',
      'GET /services/data/v68.0/query Bearer tok-1',
      'POST /services/oauth2/token',
      'GET /services/data/v68.0/query Bearer tok-2',
    ]);
  });

  it("fails as unauthorized when the app's credentials are wrong, without keeping Salesforce's description", async () => {
    const fetch = scriptedFetch({ status: 400, json: { error: 'invalid_client', error_description: 'invalid client credentials for consumer-key' } });
    const err = await createSalesforce(config, { fetch }).contacts.get(ctx, { id: CONTACT }).catch((e) => e);
    expect([err.code, err.category, err.providerCode]).toEqual(['salesforce/invalid-client', 'unauthorized', 'invalid_client']);
    expect(err.message).not.toContain('consumer-key');
  });

  it('uses the API version it is given, and refuses a bad instance URL or version', () => {
    expect(() => createSalesforce({ ...config, instanceUrl: 'http://acme.my.salesforce.com' })).toThrow(/https/);
    expect(() => createSalesforce({ ...config, apiVersion: 'latest' })).toThrow(/v68.0/);
  });
});

describe('records', () => {
  it('creates, reads, updates and deletes by id, under the configured version', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: { id: ACCOUNT, success: true, errors: [] } }, { json: { attributes: { type: 'Account' }, Id: ACCOUNT, Name: 'Acme' } }, { status: 204 }, { status: 204 });
    const sf = createSalesforce({ ...config, apiVersion: '66.0' }, { fetch });
    expect(await sf.accounts.create(ctx, { Name: 'Acme', Plan__c: 'team' })).toMatchObject({ id: ACCOUNT });
    expect((await sf.accounts.get(ctx, { id: ACCOUNT, fields: ['Name'] })).Name).toBe('Acme');
    await sf.accounts.update(ctx, { id: ACCOUNT, fields: { Website: null } });
    await sf.accounts.delete(ctx, { id: ACCOUNT });
    expect(fetch.requests.slice(1).map((r) => `${r.method} ${r.url.pathname}${r.url.search}`)).toEqual([
      'POST /services/data/v66.0/sobjects/Account',
      `GET /services/data/v66.0/sobjects/Account/${ACCOUNT}?fields=Name`,
      `PATCH /services/data/v66.0/sobjects/Account/${ACCOUNT}`,
      `DELETE /services/data/v66.0/sobjects/Account/${ACCOUNT}`,
    ]);
    expect(fetch.requests[1]!.json).toEqual({ Name: 'Acme', Plan__c: 'team' });
  });

  it('upserts by an external id and says whether it created; several matches are a conflict', async () => {
    const fetch = scriptedFetch(token, { status: 201, json: { id: CONTACT, success: true, errors: [], created: true } }, { status: 300, json: ['/services/data/v68.0/sobjects/Contact/003…'] });
    const sf = createSalesforce(config, { fetch });
    expect(await sf.contacts.upsert(ctx, { externalIdField: 'App_User_Id__c', externalId: 'u/1', fields: { LastName: 'Lovelace' } })).toMatchObject({ id: CONTACT, created: true });
    expect(fetch.requests[1]!.url.pathname).toBe('/services/data/v68.0/sobjects/Contact/App_User_Id__c/u%2F1');
    const err = await sf.contacts.upsert(ctx, { externalIdField: 'App_User_Id__c', externalId: 'u2', fields: {} }).catch((e) => e);
    expect([err.code, err.category]).toEqual(['salesforce/multiple-matches', 'conflict']);
  });

  it('checks fields before calling: required ones, and API names only', async () => {
    const sf = createSalesforce(config, { fetch: scriptedFetch() });
    await expect(sf.contacts.create(ctx, { FirstName: 'Ada' } as never)).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(sf.accounts.create(ctx, { Name: 'Acme', 'Name; DROP': 'x' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(sf.opportunities.create(ctx, { Name: 'Deal', StageName: 'Prospecting', CloseDate: 'soon' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
    await expect(sf.contacts.get(ctx, { id: 'not-an-id' })).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it("maps Salesforce's error codes to categories, keeps the code and drops the message", async () => {
    const fetch = scriptedFetch(token, { status: 400, json: [{ errorCode: 'DUPLICATES_DETECTED', message: 'Use one of these records? ada@example.com', fields: [] }] });
    const tracer = new TestTracer();
    const err = await createSalesforce(config, { fetch, tracer }).contacts.create(ctx, { LastName: 'Lovelace', Email: 'ada@example.com' }).catch((e) => e);
    expect(err).toBeInstanceOf(SalesforceError);
    expect([err.code, err.category, err.providerCode, err.status]).toEqual(['salesforce/duplicates-detected', 'conflict', 'DUPLICATES_DETECTED', 400]);
    expect(err.message).not.toContain('ada@');
    expect(tracer.spans[1]!.attributes['error.type']).toBe('DUPLICATES_DETECTED');
    assertProviderSpans(tracer.spans);
  });

  it('retries REQUEST_LIMIT_EXCEEDED as a rate limit, and nothing else', async () => {
    const limited = { status: 403, json: [{ errorCode: 'REQUEST_LIMIT_EXCEEDED', message: 'TotalRequests Limit exceeded.' }] };
    const fetch = scriptedFetch(token, limited, limited, limited, { status: 400, json: [{ errorCode: 'REQUIRED_FIELD_MISSING', message: 'Required fields are missing: [LastName]' }] });
    const sf = createSalesforce(config, { fetch, ...noWait });
    const err = await sf.soql.query(ctx, soql`SELECT Id FROM Contact`).catch((e) => e);
    expect([err.code, err.category, fetch.requests.length]).toEqual(['salesforce/request-limit-exceeded', 'rate-limited', 4]);
    const missing = await sf.contacts.create(ctx, { LastName: 'x' }).catch((e) => e);
    expect([missing.code, fetch.requests.length]).toEqual(['salesforce/required-field-missing', 5]);
  });
});

describe('SOQL', () => {
  it('escapes every interpolated value as a literal', () => {
    expect(soql`SELECT Id FROM Contact WHERE Email = ${"o'brien@example.com"} AND Name = ${'a\\b"c\nd'}`.soql).toBe(
      "SELECT Id FROM Contact WHERE Email = 'o\\'brien@example.com' AND Name = 'a\\\\b\\\"c\\nd'",
    );
    expect(soql`WHERE Id IN ${['a', 'b']} AND Amount > ${1000} AND IsWon = ${true} AND AccountId = ${null} AND CreatedDate > ${new Date('2026-11-21T10:00:00.000Z')}`.soql).toBe(
      "WHERE Id IN ('a', 'b') AND Amount > 1000 AND IsWon = true AND AccountId = null AND CreatedDate > 2026-11-21T10:00:00Z",
    );
    expect(soql`WHERE Name LIKE ${soqlLike("50%_off's", { startsWith: true })}`.soql).toBe("WHERE Name LIKE '50\\%\\_off\\'s%'");
    expect(() => soql`WHERE Amount = ${Number.NaN}`).toThrow();
    expect(() => soql`WHERE Id IN ${[]}`).toThrow();
  });

  it('runs only queries soql wrote, even ones of the same shape', async () => {
    const sf = createSalesforce(config, { fetch: scriptedFetch() });
    await expect(sf.soql.query(ctx, { soql: "SELECT Id FROM Contact WHERE Email = '' OR Name != ''" } as never)).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });

  it('sends the query and pages through every record by nextRecordsUrl, typing them with a schema', async () => {
    const more = '/services/data/v68.0/query/01gD0000002HU6KIAW-2000';
    const fetch = scriptedFetch(token, page([{ attributes: { type: 'Contact' }, Id: 'a', LastName: 'A' }], more), page([{ attributes: { type: 'Contact' }, Id: 'b', LastName: 'B' }]));
    const seen: Array<string | null | undefined> = [];
    for await (const c of createSalesforce(config, { fetch }).soql.all(ctx, soql`SELECT Id, LastName FROM Contact`, Contact)) seen.push(c.LastName);
    expect(seen).toEqual(['A', 'B']);
    expect(fetch.requests[1]!.url.searchParams.get('q')).toBe('SELECT Id, LastName FROM Contact');
    expect(fetch.requests[2]!.url.pathname).toBe(more);
    await expect(createSalesforce(config, { fetch: scriptedFetch() }).soql.queryMore(ctx, 'https://elsewhere.test/x')).rejects.toMatchObject({ code: 'validation/invalid-input' });
  });
});

describe('the same three in every CRM', () => {
  it('upsertContactByEmail creates a contact, LastName from the email, its account found by name', async () => {
    const fetch = scriptedFetch(token, page([]), page([{ attributes: { type: 'Account' }, Id: ACCOUNT }]), { status: 201, json: { id: CONTACT, success: true, errors: [] } });
    const tracer = new TestTracer();
    const result = await createSalesforce(config, { fetch, tracer }).upsertContactByEmail(ctx, { email: "ada.o'neil@example.com", company: 'Acme', properties: { LeadSource: 'Web' } });
    expect(result).toEqual({ id: CONTACT, created: true });
    expect(fetch.requests[1]!.url.searchParams.get('q')).toBe("SELECT Id, AccountId FROM Contact WHERE Email = 'ada.o\\'neil@example.com' ORDER BY CreatedDate ASC LIMIT 1");
    expect(fetch.requests[2]!.url.searchParams.get('q')).toBe("SELECT Id FROM Account WHERE Name = 'Acme' ORDER BY CreatedDate ASC LIMIT 1");
    expect(fetch.requests[3]!.json).toEqual({ LastName: "ada.o'neil", LeadSource: 'Web', Email: "ada.o'neil@example.com", AccountId: ACCOUNT });
    expect(tracer.spans.map((s) => s.name)).toEqual(['salesforce oauth.token', 'salesforce soql.query', 'salesforce soql.query', 'salesforce contacts.create']);
    assertProviderSpans(tracer.spans);
  });

  it('upsertContactByEmail updates the contact it finds, giving it an account only when it has none', async () => {
    const fetch = scriptedFetch(token, page([{ attributes: { type: 'Contact' }, Id: CONTACT, AccountId: ACCOUNT }]), { status: 204 });
    const result = await createSalesforce(config, { fetch }).upsertContactByEmail(ctx, { email: 'ada@example.com', firstName: 'Ada', company: 'Other Co' });
    expect(result).toEqual({ id: CONTACT, created: false });
    expect([fetch.requests[2]!.method, fetch.requests[2]!.url.pathname, fetch.requests[2]!.json]).toEqual(['PATCH', `/services/data/v68.0/sobjects/Contact/${CONTACT}`, { FirstName: 'Ada' }]);
  });

  it("createDeal reads the org's first open stage once, closes in 30 days, and adds the primary contact in one composite call", async () => {
    const created = { json: { compositeResponse: [{ body: { id: DEAL, success: true, errors: [] }, httpHeaders: {}, httpStatusCode: 201, referenceId: 'deal' }, { body: { id: '00K000000000001AAA', success: true, errors: [] }, httpHeaders: {}, httpStatusCode: 201, referenceId: 'role' }] } };
    const fetch = scriptedFetch(token, page([{ attributes: { type: 'OpportunityStage' }, ApiName: 'Discovery' }]), created, { status: 201, json: { id: DEAL, success: true, errors: [] } });
    const sf = createSalesforce(config, { fetch });
    expect(await sf.createDeal(ctx, { name: 'Acme, 50 seats', amount: 12000, contactId: CONTACT, companyId: ACCOUNT })).toEqual({ id: DEAL });
    expect(fetch.requests[1]!.url.searchParams.get('q')).toBe('SELECT ApiName FROM OpportunityStage WHERE IsActive = true AND IsClosed = false ORDER BY SortOrder ASC LIMIT 1');
    const close = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    expect(fetch.requests[2]!.json).toEqual({
      allOrNone: true,
      compositeRequest: [
        { method: 'POST', url: '/services/data/v68.0/sobjects/Opportunity', referenceId: 'deal', body: { CloseDate: close, Name: 'Acme, 50 seats', StageName: 'Discovery', Amount: 12000, AccountId: ACCOUNT } },
        { method: 'POST', url: '/services/data/v68.0/sobjects/OpportunityContactRole', referenceId: 'role', body: { OpportunityId: '@{deal.id}', ContactId: CONTACT, IsPrimary: true } },
      ],
    });
    // The stage is kept; a given CloseDate wins over the default
    await sf.createDeal(ctx, { name: 'Renewal', properties: { CloseDate: '2027-01-31' } });
    expect(fetch.requests[3]!.json).toMatchObject({ Name: 'Renewal', StageName: 'Discovery', CloseDate: '2027-01-31' });
  });

  it("names the default stage by MasterLabel where the org's OpportunityStage has no ApiName", async () => {
    const fetch = scriptedFetch(
      token,
      { status: 400, json: [{ errorCode: 'INVALID_FIELD', message: "No such column 'ApiName' on entity 'OpportunityStage'." }] },
      page([{ attributes: { type: 'OpportunityStage' }, MasterLabel: 'Prospecting' }]),
      { status: 201, json: { id: DEAL, success: true, errors: [] } },
    );
    await createSalesforce(config, { fetch }).createDeal(ctx, { name: 'Deal' });
    expect(fetch.requests[2]!.url.searchParams.get('q')).toBe('SELECT MasterLabel FROM OpportunityStage WHERE IsActive = true AND IsClosed = false ORDER BY SortOrder ASC LIMIT 1');
    expect(fetch.requests[3]!.json).toMatchObject({ StageName: 'Prospecting' });
  });

  it('fails a composite call with the subrequest that failed, on its span, after Salesforce rolled it back', async () => {
    const failed = {
      json: {
        compositeResponse: [
          { body: [{ errorCode: 'PROCESSING_HALTED', message: 'The transaction was rolled back since another operation in the same transaction failed.' }], httpHeaders: {}, httpStatusCode: 400, referenceId: 'deal' },
          { body: [{ errorCode: 'INVALID_CROSS_REFERENCE_KEY', message: 'invalid cross reference id' }], httpHeaders: {}, httpStatusCode: 400, referenceId: 'role' },
        ],
      },
    };
    const tracer = new TestTracer();
    const err = await createSalesforce(config, { fetch: scriptedFetch(token, failed), tracer }).createDeal(ctx, { name: 'Deal', stage: 'Prospecting', contactId: CONTACT }).catch((e) => e);
    expect([err.code, err.category, err.providerCode, err.status]).toEqual(['salesforce/invalid-reference', 'invalid-request', 'INVALID_CROSS_REFERENCE_KEY', 200]);
    expect(err.message).toBe('salesforce composite.execute failed: subrequest role answered 400');
    expect(err.message).not.toContain('cross reference id');
    expect(tracer.spans[1]!.name).toBe('salesforce composite.execute');
    expect(tracer.spans[1]!.attributes['error.type']).toBe('INVALID_CROSS_REFERENCE_KEY');
    assertProviderSpans(tracer.spans);
  });

  it('addNote makes a ContentNote from escaped text and links it to each record, all or none', async () => {
    const ok = (ref: string, id: string) => ({ body: { id, success: true, errors: [] }, httpHeaders: {}, httpStatusCode: 201, referenceId: ref });
    const fetch = scriptedFetch(token, { json: { compositeResponse: [ok('note', '069000000000001AAA'), ok('link0', '06A000000000001AAA'), ok('link1', '06A000000000002AAA')] } });
    const body = 'Call recap\nThey want <SSO> & SCIM';
    expect(await createSalesforce(config, { fetch }).addNote(ctx, { body, contactId: CONTACT, dealId: DEAL })).toEqual({ id: '069000000000001AAA' });
    const sent = fetch.requests[1]!.json as { compositeRequest: Array<{ url: string; body: Record<string, string> }> };
    expect(sent.compositeRequest.map((r) => r.url)).toEqual(['/services/data/v68.0/sobjects/ContentNote', '/services/data/v68.0/sobjects/ContentDocumentLink', '/services/data/v68.0/sobjects/ContentDocumentLink']);
    expect(sent.compositeRequest[0]!.body.Title).toBe('Call recap');
    expect(Buffer.from(sent.compositeRequest[0]!.body.Content!, 'base64').toString('utf8')).toBe('<p>Call recap</p><p>They want &lt;SSO&gt; &amp; SCIM</p>');
    expect(sent.compositeRequest[1]!.body).toEqual({ ContentDocumentId: '@{note.id}', LinkedEntityId: CONTACT, ShareType: 'I', Visibility: 'AllUsers' });
    expect(noteHtml(`a"b'c`)).toBe('<p>a&quot;b&#39;c</p>');
  });
});

describe('settings', () => {
  it('reads from the environment by name, and says where to find each', () => {
    const env: Record<string, string> = { SALESFORCE_INSTANCE_URL: 'https://acme--uat.sandbox.my.salesforce.com', SALESFORCE_CLIENT_ID: 'id', SALESFORCE_CLIENT_SECRET: 'secret' };
    expect(settingsFromEnv(settings, (n) => env[n])).toEqual({ instanceUrl: 'https://acme--uat.sandbox.my.salesforce.com', clientId: 'id', clientSecret: 'secret' });
    expect(settings.every((s) => s.whereToFind)).toBe(true);
    // Sandbox and production credentials look alike: nothing is checked per environment
    expect(settings.every((s) => !s.environments)).toBe(true);
    expect(checkSetting(settings[0]!, 'production', 'https://acme--uat.sandbox.my.salesforce.com')).toBeNull();
  });
});

describe('webhooks from a flow', () => {
  const event: SalesforceFlowEvent = { event: 'contact.updated', sobject: 'Contact', recordId: CONTACT, changedAt: '2026-11-21T10:00:00.000Z', fields: { Email: 'ada@example.com' } };

  class SalesforceWebhooks extends WebhookController {
    readonly prefix = 'salesforce';
    readonly auth = salesforceFlowWebhookAuth(['new-secret-0123456789', 'old-secret-0123456789']);
    init() {
      this.post('records', { mode: 'direct', procedure: 'crm.fromSalesforce', eventType: salesforceEventType }, async (_ctx, body) => SalesforceFlowEvent.parse(body));
    }
  }

  it('receives a call with the shared secret through WebhookServer, with its span, and refuses one without it', async () => {
    const received: unknown[] = [];
    const tracer = new TestTracer();
    const communication = { call: async (_ctx: unknown, _name: string, input: unknown) => { received.push(input); return { ok: true }; } } as never;
    const server = new WebhookServer({ name: 'webhooks', logger }, { communication, tracer }).registerController(new SalesforceWebhooks());
    const post = (headers: Record<string, string>, payload: string) => server.inject({ method: 'POST', url: '/salesforce/records', headers: { 'content-type': 'application/json', ...headers }, payload });

    const { rawBody, headers } = salesforceFlowWebhook(event, 'old-secret-0123456789');
    expect((await post(headers, rawBody)).statusCode).toBe(200);
    expect((received[0] as SalesforceFlowEvent).recordId).toBe(CONTACT);
    expect(tracer.spans.map((s) => [s.name, s.kind, s.attributes['mariachi.integration.event']])).toEqual([['salesforce webhook', 'server', 'contact.updated']]);

    const forged = salesforceFlowWebhook(event, 'guess');
    expect((await post(forged.headers, forged.rawBody)).statusCode).toBe(401);
    expect((await post({}, rawBody)).statusCode).toBe(401);
    expect(received).toHaveLength(1);
  });
});

describe('the fake', () => {
  it('stands in for the client in an app’s tests', async () => {
    const sf = fakeSalesforce({ records: { Account: [{ Name: 'Acme' }] } });
    const first = await sf.upsertContactByEmail(ctx, { email: 'ada@example.com', company: 'Acme' });
    const again = await sf.upsertContactByEmail(ctx, { email: 'ADA@example.com', firstName: 'Ada' });
    expect([first.created, again.created, again.id]).toEqual([true, false, first.id]);
    const contact = await sf.contacts.get(ctx, { id: first.id });
    expect([contact.LastName, contact.FirstName, typeof contact.AccountId]).toEqual(['ada', 'Ada', 'string']);
    const deal = await sf.createDeal(ctx, { name: 'Deal', contactId: first.id });
    expect(sf.records_.get('Opportunity')!.get(deal.id)).toMatchObject({ StageName: 'Prospecting', Name: 'Deal' });
    await sf.addNote(ctx, { body: 'Hello\nthere', dealId: deal.id });
    expect(sf.notes_).toEqual([expect.objectContaining({ title: 'Hello', linkedTo: [deal.id] })]);
    expect((await sf.soql.query(ctx, soql`SELECT Id FROM Contact WHERE Email = ${'ada@example.com'}`)).records).toHaveLength(1);
    await expect(sf.soql.query(ctx, soql`SELECT COUNT() FROM Contact GROUP BY Email`)).rejects.toMatchObject({ code: 'salesforce/fake-unsupported-query' });
    await expect(sf.contacts.get(ctx, { id: DEAL })).rejects.toMatchObject({ category: 'not-found' });
  });
});
